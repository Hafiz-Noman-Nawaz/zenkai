import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Zap } from 'lucide-react';

/**
 * Ultra-lightweight Web Audio Electric Buzz & Tron Synth
 */
class ElectricSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.humOsc = null;
    this.humGain = null;
    this.isHumming = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startHum() {
    if (this.isMuted || !this.ctx || this.isHumming) return;
    try {
      this.init();
      const now = this.ctx.currentTime;

      this.humOsc = this.ctx.createOscillator();
      this.humOsc.type = 'sawtooth';
      this.humOsc.frequency.setValueAtTime(140, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.001, now);
      this.humGain.gain.linearRampToValueAtTime(0.03, now + 0.05);

      this.humOsc.connect(filter);
      filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      this.humOsc.start(now);
      this.isHumming = true;
    } catch (e) {}
  }

  modulateHum(speed) {
    if (!this.isHumming || !this.ctx || !this.humOsc) return;
    try {
      const now = this.ctx.currentTime;
      const freq = Math.min(280, 140 + speed * 2.5);
      this.humOsc.frequency.setTargetAtTime(freq, now, 0.03);
    } catch (e) {}
  }

  stopHum() {
    if (!this.isHumming || !this.ctx || !this.humGain) return;
    try {
      const now = this.ctx.currentTime;
      this.humGain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      setTimeout(() => {
        if (this.humOsc) {
          try {
            this.humOsc.stop();
            this.humOsc.disconnect();
          } catch (e) {}
          this.humOsc = null;
        }
        this.isHumming = false;
      }, 70);
    } catch (e) {
      this.isHumming = false;
    }
  }

  playElectricBuzz() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      const buzzOsc = this.ctx.createOscillator();
      const buzzGain = this.ctx.createGain();
      buzzOsc.type = 'sawtooth';
      buzzOsc.frequency.setValueAtTime(200, now);
      buzzOsc.frequency.linearRampToValueAtTime(60, now + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.0, now);

      buzzGain.gain.setValueAtTime(0.18, now);
      buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      buzzOsc.connect(filter);
      filter.connect(buzzGain);
      buzzGain.connect(this.ctx.destination);

      buzzOsc.start(now);
      buzzOsc.stop(now + 0.12);
    } catch (e) {}
  }
}

const soundEngine = new ElectricSoundEngine();

export const KamehamehaCursor = () => {
  const canvasRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.isMuted = next;
    if (next) soundEngine.stopHum();
  }, [isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = null;
    let isLoopRunning = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const TRAIL_LIFETIME_MS = 250;
    const trail = [];
    const lightningBolts = [];

    let lastX = -100;
    let lastY = -100;
    let stopTimeout = null;

    // Start render loop only when active
    const requestFrameIfNeeded = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(render);
      }
    };

    const generateLightning = (x1, y1, angle, length, depth) => {
      if (depth <= 0 || length < 4) return;
      const segments = 3;
      let curX = x1;
      let curY = y1;
      const segLen = length / segments;
      const points = [{ x: curX, y: curY }];

      for (let i = 0; i < segments; i++) {
        const rad = angle + (Math.random() - 0.5) * 0.7;
        curX += Math.cos(rad) * segLen;
        curY += Math.sin(rad) * segLen;
        points.push({ x: curX, y: curY });

        if (Math.random() > 0.6 && depth > 1) {
          generateLightning(curX, curY, angle + (Math.random() > 0.5 ? 0.7 : -0.7), length * 0.5, depth - 1);
        }
      }

      lightningBolts.push({
        points,
        life: 1.0,
        decay: Math.random() * 0.1 + 0.15,
        color: Math.random() > 0.4 ? '#00f0ff' : '#e0f2fe',
      });

      requestFrameIfNeeded();
    };

    const onMouseMove = (e) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1.5 || trail.length === 0) {
        const nx = dist > 0 ? -dy / dist : 0;
        const ny = dist > 0 ? dx / dist : 1;

        trail.unshift({
          x,
          y,
          nx,
          ny,
          time: now,
          speed: dist,
        });

        soundEngine.startHum();
        soundEngine.modulateHum(dist);

        clearTimeout(stopTimeout);
        stopTimeout = setTimeout(() => {
          soundEngine.stopHum();
        }, 100);

        lastX = x;
        lastY = y;

        requestFrameIfNeeded();
      }
    };

    const onPointerDown = (e) => {
      const x = e.clientX || (e.touches && e.touches[0]?.clientX) || lastX;
      const y = e.clientY || (e.touches && e.touches[0]?.clientY) || lastY;

      soundEngine.playElectricBuzz();

      const count = 6;
      for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const length = Math.random() * 35 + 25;
        generateLightning(x, y, baseAngle, length, 2);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    // Render loop with Auto-Sleep
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const now = performance.now();

      while (trail.length > 0 && now - trail[trail.length - 1].time > TRAIL_LIFETIME_MS) {
        trail.pop();
      }

      // Draw Tron Ribbon
      if (trail.length >= 2) {
        ctx.save();
        const topPoints = [];
        const bottomPoints = [];
        const maxRibbonWidth = 6;

        for (let i = 0; i < trail.length; i++) {
          const p = trail[i];
          const age = (now - p.time) / TRAIL_LIFETIME_MS;
          const taper = Math.max(0.05, 1 - age);
          const halfW = (maxRibbonWidth * taper) / 2;

          topPoints.push({ x: p.x + p.nx * halfW, y: p.y + p.ny * halfW });
          bottomPoints.push({ x: p.x - p.nx * halfW, y: p.y - p.ny * halfW });
        }

        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          ctx.lineTo(topPoints[i].x, topPoints[i].y);
        }
        for (let i = bottomPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
        }
        ctx.closePath();

        const head = trail[0];
        const tail = trail[trail.length - 1];
        const grad = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        grad.addColorStop(0.5, 'rgba(0, 150, 255, 0.4)');
        grad.addColorStop(1, 'rgba(0, 100, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fill();

        // Neon Top Edge
        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          ctx.lineTo(topPoints[i].x, topPoints[i].y);
        }
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Neon Bottom Edge
        ctx.beginPath();
        ctx.moveTo(bottomPoints[0].x, bottomPoints[0].y);
        for (let i = 1; i < bottomPoints.length; i++) {
          ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      // Draw Lightning Sparks
      for (let i = lightningBolts.length - 1; i >= 0; i--) {
        const bolt = lightningBolts[i];
        bolt.life -= bolt.decay;

        if (bolt.life <= 0) {
          lightningBolts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = Math.max(1, 1.5 * bolt.life);
        ctx.globalAlpha = bolt.life;

        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let j = 1; j < bolt.points.length; j++) {
          ctx.lineTo(bolt.points[j].x, bolt.points[j].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // If nothing left on screen, sleep to conserve 100% CPU/GPU
      if (trail.length === 0 && lightningBolts.length === 0) {
        ctx.clearRect(0, 0, width, height);
        isLoopRunning = false;
        animId = null;
      } else {
        animId = requestAnimationFrame(render);
      }
    };

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointerdown', onPointerDown);
      clearTimeout(stopTimeout);
      soundEngine.stopHum();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden will-change-transform"
        style={{ width: '100vw', height: '100vh', transform: 'translateZ(0)' }}
      />

      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all duration-200 shadow-md text-xs font-semibold ${
            !isMuted
              ? 'bg-zenkai-card/90 text-cyan-300 border-cyan-500/40'
              : 'bg-zenkai-card/60 text-zenkai-dim border-zenkai-border'
          }`}
          title={isMuted ? 'Unmute Electric FX' : 'Mute Electric FX'}
        >
          <Zap className={`w-3.5 h-3.5 ${!isMuted ? 'text-cyan-400' : 'text-zenkai-dim'}`} />
          {!isMuted ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zenkai-dim" />
          )}
        </button>
      </div>
    </>
  );
};
