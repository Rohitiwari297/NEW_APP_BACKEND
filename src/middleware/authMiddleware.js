import config from "../config/config.js";
import ApiError from "../utils/ApiErrorHandler.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import jwt from 'jsonwebtoken'

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