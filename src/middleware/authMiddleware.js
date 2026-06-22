import config from "../config/config.js";
import ApiError from "../utils/ApiErrorHandler.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import jwt from 'jsonwebtoken'
import User from "../models/user.model.js";

export const isLoggedIn = AsyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.AccessToken ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    try {
        const decoded = jwt.verify(
            token,
            config.ACCESS_TOKEN_SECRET
        );

        req.userId = decoded.id;
        req.user = decoded;

        next();
    } catch (error) {
        throw new ApiError(401, "Invalid credentials");
    }
});

export const isAdmin = AsyncHandler(async (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        throw new ApiError(403, "Access denied. Admin only.");
    }
    next();
});

export const isEditor = AsyncHandler(async (req, res, next) => {
    if (req.user.role !== 'EDITOR' && req.user.role !== 'ADMIN') {
        throw new ApiError(403, "Access denied. Editor/Admin only.");
    }

    // Check if user is active
    const user = await User.findOne({ authId: req.userId });
    if (!user || user.status !== 'active') {
        throw new ApiError(403, "Access denied. Your account is inactive.");
    }

    next();
});

export const isReporter = AsyncHandler(async (req, res, next) => {
    if (req.user.role !== 'REPORTER' && req.user.role !== 'ADMIN') {
        throw new ApiError(403, "Access denied. Reporter/Admin only.");
    }
    next();
});