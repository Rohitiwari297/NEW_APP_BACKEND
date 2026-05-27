import AsyncHandler from '../../utils/AsyncHandler.js'
import ApiError from '../../utils/ApiErrorHandler.js'
import ApiResponse from '../../utils/ApiRespinseHandler.js'
import { fileDelete } from '../../utils/FileDelete.js'
import Auth from '../../models/auth.model.js'
import User from '../../models/user.model.js'
import bcrypt from 'bcrypt'
import config from '../../config/config.js'
import { setAuthCookies } from '../../utils/cookie.Handler.js'

export const signup = AsyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
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

    const user = await User.create({
        authId: auth._id,
        fullName: fullName,
        // avitar: avitar
    })

    if (!user) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'Failed to create user')
    }

    const responseData = {
        email: auth.email,
        fullName: user.fullName
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

    const token = auth.generateAccessToken(user)

    setAuthCookies(res, token)
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
            }
        )
    )

});
