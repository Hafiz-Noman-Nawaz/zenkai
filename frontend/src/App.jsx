import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { KamehamehaCursor } from './components/KamehamehaCursor';
import { ZenkaiLounge } from './components/ZenkaiLounge';
import { Loader2 } from 'lucide-react';

// Priority Core Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';

// Lazy Loaded Pages for Instant App Startup
const SchedulePage = lazy(() => import('./pages/SchedulePage').then(m => ({ default: m.SchedulePage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then(m => ({ default: m.ComparePage })));
const TierListPage = lazy(() => import('./pages/TierListPage').then(m => ({ default: m.TierListPage })));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const RandomPage = lazy(() => import('./pages/RandomPage').then(m => ({ default: m.RandomPage })));
const AnimeDetailPage = lazy(() => import('./pages/AnimeDetailPage').then(m => ({ default: m.AnimeDetailPage })));
const MyAnimePage = lazy(() => import('./pages/MyAnimePage').then(m => ({ default: m.MyAnimePage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Ultra-fast Page Fallback
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    <span className="text-[11px] font-mono text-zenkai-dim tracking-widest uppercase">
      Loading Chronicle...
    </span>
  </div>
);

// Scroll to top on navigation helper
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-zenkai-bg text-zenkai-text overflow-x-hidden">
      <ScrollToTop />
      {/* Kamehameha Ki Ray & Electric Shockwave Canvas */}
      <KamehamehaCursor />

      {/* Global Navigation Header */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Responsive Viewport Container */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 xl:px-12 pt-20 sm:pt-28 overflow-hidden">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/tierlist" element={<TierListPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/random" element={<RandomPage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/my-anime" element={<MyAnimePage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Floating Zenkai Lounge 24/7 Lofi & Audio Player */}
      <ZenkaiLounge />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MainLayout />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
