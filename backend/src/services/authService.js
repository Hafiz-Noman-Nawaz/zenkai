// Authentication Service
const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');

class AuthService {
  static async registerUser({ username, email, password, displayName }) {
    // Check if username or email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        throw ApiError.conflict('Username is already taken');
      }
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        throw ApiError.conflict('Email is already registered');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        passwordHash,
        displayName: displayName || username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    return {
      user,
      token,
    };
  }

  static async loginUser({ email, username, password }) {
    // Search user by email or username
    const identifierCondition = email
      ? { email: { equals: email, mode: 'insensitive' } }
      : { username: { equals: username, mode: 'insensitive' } };

    const user = await prisma.user.findFirst({
      where: identifierCondition,
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email/username or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email/username or password');
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: safeUser,
      token,
    };
  }

  static async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}

module.exports = AuthService;
