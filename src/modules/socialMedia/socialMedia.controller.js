import SocialMediaModel from "../../models/socialMedia.model.js";
import ApiError from "../../utils/ApiErrorHandler.js"
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import AsyncHandler from "../../utils/AsyncHandler.js";

export const likeArticle = AsyncHandler(async (req, res) => {
    const userId = req.userId;
    const { articleId } = req.params;


    if (!userId) {
        throw new ApiError(403, 'Unauthorized user')
    };

    if (!articleId) {
        throw new ApiError(400, 'News Id missing in params')
    }

    let social = await SocialMediaModel.findOne({ articleId });

    if (!social) {
        social = await SocialMediaModel.create({ articleId });
    }

    const alreadyLiked = social.likes.some(
        id => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
        social.likes.pull(userId);
        await social.save();

        return res.status(200).json(
            new ApiResponse(200, "Unliked successfully", {
                liked: false,
                likesCount: social.likes.length,
            })
        );
    }

    console.log('social', social);
    social.likes.addToSet(userId);
    social.dislikes.pull(userId);

    await social.save();

    const data = {
        liked: true,
        likesCount: social.likes.length,
    }

    res.status(200).json(
        new ApiResponse(200, 'Article liked successfully', data)
    )


})

export const dislikeArticle = AsyncHandler(async (req, res) => {
    const userId = req.userId;
    const { articleId } = req.params;

    if (!userId) {
        throw new ApiError(403, 'Unauthorized user')
    };

    if (!articleId) {
        throw new ApiError(400, 'News Id missing in params')
    }
    let social = await SocialMediaModel.findOne({ articleId });

    if (!social) {
        social = await SocialMediaModel.create({ articleId });
    }

    social.dislikes.addToSet(userId);

    /**
     * REMOVE ID FROM LIKES
     */
    social.likes.pull(userId);
    await social.save();

    const data = {
        disliked: true,
        unlikesCount: social.dislikes.length,
    }
    res.status(200).json(
        new ApiResponse(200, 'Article disliked successfully', data)
    )
})

export const commentOnArticle = AsyncHandler(async (req, res) => {
    const userId = req.userId;
    const { articleId } = req.params;
    const { comment } = req.body;

    if (!userId) {
        throw new ApiError(403, 'Unauthorized user')
    };

    if (!articleId) {
        throw new ApiError(400, 'News Id missing in params')
    }

    if (!comment) {
        throw new ApiError(400, 'Comment text is required')
    }
    let social = await SocialMediaModel.findOne({ articleId });

    if (!social) {
        social = await SocialMediaModel.create({ articleId });
    }

    social.comments.push({
        userId,
        comment
    })

    social.save();

    const data = {
        commentCount: social.comments.length
    }

    res.status(200).json(
        new ApiResponse(200, 'Commnet added successfully', data)
    )

})

export const saveArticle = AsyncHandler(async (req, res) => {
    const userId = req.userId;
    const { articleId } = req.params;

    if (!userId) {
        throw new ApiError(403, 'Unauthorized user')
    };

    if (!articleId) {
        throw new ApiError(400, 'News Id missing in params')
    }

    let social = await SocialMediaModel.findOne({ articleId });

    if (!social) {
        social = await SocialMediaModel.create({ articleId });
    }

    const alreadySaved = social.saves.some(id => id.toString() === userId.toString())
    if (alreadySaved) {
        social.saves.pull(userId)
        await social.save();

        const data = {
            savedCount: social.saves.length
        }
        res.status(200).json(
            new ApiResponse(200, 'Article remove from save list', data)
        )
    }

    social.saves.addToSet(userId)
    await social.save();

    const data = {
        savedCount: social.saves.length
    }

    res.status(200).json(
        new ApiResponse(200, 'Article saved successfully', data)
    )


})

export const getSocialDetails = AsyncHandler(async (req, res) => {
    const { articleId } = req.params;

    const social = await SocialMediaModel.findOne({ articleId });

    if (!social) {
        return res.status(200).json(
            new ApiResponse(200, "No social activity found", {
                likesCount: 0,
                unlikesCount: 0,
                savesCount: 0,
                commentsCount: 0,
                comments: [],
            })
        );
    }

    return res.status(200).json(
        new ApiResponse(200, "Social details fetched successfully", {
            likesCount: social.likes.length,
            dislikesCount: social.dislikes.length,
            savesCount: social.saves.length,
            commentsCount: social.comments.length,
            comments: social.comments,
        })
    );
});