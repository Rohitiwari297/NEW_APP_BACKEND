import AsyncHandler from '../../utils/AsyncHandler.js'
import ApiError from '../../utils/ApiErrorHandler.js'
import ApiResponse from '../../utils/ApiRespinseHandler.js'
import { fileDelete } from '../../utils/FileDelete.js'
import Auth from '../../models/auth.model.js'
import User from '../../models/user.model.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import config from '../../config/config.js'
import { setAuthCookies } from '../../utils/cookie.Handler.js'
import sessionModel from '../../models/session.model.js'
import jwt from 'jsonwebtoken'
import path from 'path'

export const signup = AsyncHandler(async (req, res) => {
    const { fullName, email, password, location, role } = req.body;

    if (!fullName || !email || !password || !location) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'All fields are mendatory')
    };

    const normalizedEmail = email.toLowerCase().trim();

    const validatateDuplicateEmail = await Auth.findOne({ normalizedEmail });
    if (validatateDuplicateEmail) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'Email already registered')
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.BCRYPT_SALT_ROUNDS))

    const auth = await Auth.create({
        email: email,
        password: hashedPassword
    })

    if (!auth) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'Failed to create auth')
    }

    const image = req.file.path
    const result = `uploads/${path.basename(image)}`;
    console.log('image', result)

    const roleInCaps = role.toUpperCase()
    const user = await User.create({
        authId: auth._id,
        fullName: fullName,
        role: roleInCaps,
        location,
        avitar: result
    })

    if (!user) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'Failed to create user')
    }

    const responseData = {
        email: auth.email,
        fullName: user.fullName,
        role: user.role,
        location: user.location
    }

    return res.status(201).json(
        new ApiResponse(201, 'User registration has been completed', responseData)
    )

});

export const login = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and Password are required');

    const normalizedEmail = email.toLowerCase().trim();

    const auth = await Auth.findOne({ email: normalizedEmail })
    if (!auth) throw new ApiError(401, "Invalid credentials");

    const user = await User.findOne({
        authId: auth._id
    })
    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, auth.password)
    if (!isPasswordCorrect) throw new ApiError(401, `Invalid credentials`);

    const refreshToken = auth.generateRefreshToken(user)
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    //create session
    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = auth.generateAccessToken(user)

    setAuthCookies(res, refreshToken)

    return res.status(200).json(
        new ApiResponse(
            200,
            "User logged in successfully",
            {
                user: {
                    fullName: user.fullName,
                    email: auth.email,
                    avatar: user.avatar,
                    role: user.role,
                },
                accessToken: accessToken
            }
        )
    )

});

export const refreshAccessToken = AsyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token not found')
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(401).json(
            new ApiResponse(401, 'Invalid refresh token', [])
        )
    }

    const decoded = jwt.verify(refreshToken, config.ACCESS_TOKEN_SECRET);
    const user = await User.findOne({
        authId: decoded._id
    })

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    const accessToken = auth.generateAccessToken(user)

    const newRefreshToken = auth.generateRefreshToken(user)
    setAuthCookies(res, newRefreshToken)

    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save()

    res.status(200).json(
        new ApiResponse(200, 'Access token generate sucessfully', { accessToken })
    )


})
