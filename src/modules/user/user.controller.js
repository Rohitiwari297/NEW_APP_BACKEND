import Auth from "../../models/auth.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiErrorHandler.js";
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import AsyncHandler from "../../utils/AsyncHandler.js";
import path from 'path'

export const getProfile = AsyncHandler(async (req, res) => {
    console.log("req.query =>", req.query);
    console.log("authId =>", req.query.authId);

    const queryObj = {}

    if (req.query) {
        queryObj.authId = req.query.authId
    }

    if (req.userId) {
        queryObj.authId = req.userId
    }

    console.log(queryObj)
    const user = await User.find(queryObj)
        .populate({
            path: 'authId',
            select: 'email'
        })

    console.log("user", user)

    if (!user) {
        throw new ApiError(400, 'Invalid user Id!')
    };

    res.status(200).json(
        new ApiResponse(200, 'Data feched successfully', user)
    )

});

export const updateProfile = AsyncHandler(async (req, res) => {
    const { fullName, location } = req.body;
    const userId = req.userId;

    const user = await User.findOne({
        authId: userId
    });

    if (!user) {
        throw new ApiError(401, "Unauthorized user");
    }

    const avitar = req.file?.path;

    if (avitar) {
        user.avitar = `uploads/${path.basename(avitar)}`;
    }

    user.fullName = fullName ?? user.fullName;
    user.location = location ?? user.location;

    await user.save();

    res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", user)
    );
});

export const updateAvatar = AsyncHandler(async (req, res) => {

});

export const getAllUsers = AsyncHandler(async (req, res) => {
    const queryObj = {};
    const reqQuery = req.query.userType
    const roleInUpperCase = reqQuery.toUpperCase()

    if (req.query.userType) {
        queryObj.role = roleInUpperCase
    }


    const users = await User.find(queryObj)
        .populate({
            path: 'authId',
            select: 'email'
        });

    res.status(200).json(
        new ApiResponse(200, 'Users fetched successfully', users)
    );
});

export const updateUserStatus = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
        throw new ApiError(400, 'Invalid status value');
    }

    const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
        new ApiResponse(200, 'User status updated successfully', user)
    );
});