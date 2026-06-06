import Auth from "../../models/auth.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiErrorHandler.js";
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import AsyncHandler from "../../utils/AsyncHandler.js";

export const getProfile = AsyncHandler(async (req, res) => {
    const queryObj = {}

    if (req.query) {
        queryObj.authId = req.query.authId
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
    const { name } = req.body;

});

export const updateAvatar = AsyncHandler(async (req, res) => {

});