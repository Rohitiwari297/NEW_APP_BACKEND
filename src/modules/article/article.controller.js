import AsyncHandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ApiErrorHandler.js";
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import Article from "../../models/article.model.js";
import mongoose from "mongoose";
import { fileDelete } from "../../utils/FileDelete.js";
import path from 'path'
import User from "../../models/user.model.js";
import { roleContaints } from '../../validators/constaints.js'
import Category from '../../models/category.model.js'


const parseUploadArray = (files, fieldName) => {
    if (!files?.[fieldName]) return undefined;
    return files[fieldName].map((file) => ({
        public_id: file.filename,
        url: `uploads/${path.basename(file.path)}`,
    }));
};

// Create a new article
export const createArticle = AsyncHandler(async (req, res) => {
    const userId = req.userId
    const userRole = req.user.role


    if ([userRole !== roleContaints.admin, userRole !== roleContaints.reporter, userRole !== roleContaints.editor].includes(userRole)) {
        throw new ApiError(403, "You are not Authorized to access this api");
    }


    const { catId, newsName, content, images, videos, language, tags } = req.body;

    const imageUploadData = parseUploadArray(req.files, "images");
    const videoUploadData = parseUploadArray(req.files, "videos");

    try {

        if (!userId) {
            throw new ApiError(401, "Unauthorized");
        }

        if (!content) {
            throw new ApiError(400, "News content is required");
        }

        if (!catId && !mongoose.Types.ObjectId.isValid(catId)) {
            throw new ApiError(400, "Invalid category ID format");
        }

        const user = await User.findOne({
            authId: userId
        })

        if (!user) {
            throw new ApiError(400, 'Invalid user')
        }


        const saparateTags = tags?.split(' ')

        const languageInCaps = language.toUpperCase()
        const newArticle = await Article.create({
            catId,
            createdBy: user._id,
            newsName,
            content,
            tags: saparateTags,
            language: languageInCaps,
            status: req.body.status || 'draft',
            images: imageUploadData ?? images,
            videos: videoUploadData ?? videos,
        });

        return res.status(201).json(
            new ApiResponse(201, "Article created successfully", newArticle)
        );
    } catch (error) {

        if (imageUploadData?.length) {
            await Promise.all(
                imageUploadData.map((file) => {
                    fileDelete(file.path)
                })
            )
        }

        if (videoUploadData?.length) {
            await Promise.all(
                videoUploadData.map((file) => {
                    fileDelete(file.path)
                })
            )

        }

        console.log(`Server error while creating the Article, Error:${error}`)

    }
});

// Get all articles or filter by category
export const getArticles = AsyncHandler(async (req, res) => {
    const authId = req.userId;
    const role = req.user?.role;
    const query = {};


    // Category Filter
    if (req.query.catId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.catId)) {
            throw new ApiError(400, "Invalid category ID format");
        }

        query.catId = new mongoose.Types.ObjectId(req.query.catId);
    }

    // Status Filter
    if (req.query.status) {
        query.status = req.query.status;
    } else if (role === "USER") {
        // Don't show Draft articles to the Normal user
        query.status = { $ne: "draft" };
    }

    // Language Filter
    if (req.query.lang) {
        query.language = req.query.lang.toUpperCase();
    }

    // Search Filter
    if (req.query.search) {
        query.newsName = {
            $regex: req.query.search,
            $options: "i"
        };
    }

    console.log("Query:", query);

    const articles = await Article.aggregate([
        {
            $match: query
        },

        // Category Details
        {
            $lookup: {
                from: "categories",
                localField: "catId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        },

        // Reporter Details
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "reporter"
            }
        },
        {
            $unwind: {
                path: "$reporter",
                preserveNullAndEmptyArrays: true
            }
        },

        // Social Details
        {
            $lookup: {
                from: "socials",
                localField: "_id",
                foreignField: "articleId",
                as: "social"
            }
        },
        {
            $unwind: {
                path: "$social",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $project: {
                _id: 1,
                newsName: 1,
                content: 1,
                images: 1,
                videos: 1,
                language: 1,
                tags: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,

                createdBy: {
                    _id: "$reporter._id",
                    name: "$reporter.fullName",
                    location: "$reporter.location"
                },

                category: {
                    _id: "$category._id",
                    catName: "$category.catName"
                },

                isLiked: {
                    $in: [
                        new mongoose.Types.ObjectId(authId),
                        { $ifNull: ["$social.likes", []] }
                    ]
                },

                likesCount: {
                    $size: {
                        $ifNull: ["$social.likes", []]
                    }
                },

                isDisliked: {
                    $in: [
                        new mongoose.Types.ObjectId(authId),
                        { $ifNull: ["$social.dislikes", []] }
                    ]
                },

                dislikesCount: {
                    $size: {
                        $ifNull: ["$social.dislikes", []]
                    }
                },

                isSaved: {
                    $in: [
                        new mongoose.Types.ObjectId(authId),
                        { $ifNull: ["$social.saves", []] }
                    ]
                },

                savesCount: {
                    $size: {
                        $ifNull: ["$social.saves", []]
                    }
                },

                commentsCount: {
                    $size: {
                        $ifNull: ["$social.comments", []]
                    }
                }
            }
        },

        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Articles fetched successfully",
            articles
        )
    );
});

//Get My articles or filter by category
export const getMyArticles = AsyncHandler(async (req, res) => {
    const authId = req.userId;
    const userRoles = req.user.role;
    const userRole = userRoles.toUpperCase()

    if (![roleContaints.reporter, roleContaints.editor].includes(userRole)) {
        throw new ApiError(403, "Only reporters can access this API");
    }

    const user = await User.findOne({ authId });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const articles = await Article.aggregate([
        {
            $match: {
                createdBy: user._id
            }
        },

        // Category
        {
            $lookup: {
                from: "categories",
                localField: "catId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        },

        // Reporter
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "reporter"
            }
        },
        {
            $unwind: {
                path: "$reporter",
                preserveNullAndEmptyArrays: true
            }
        },

        // Social
        {
            $lookup: {
                from: "socials",
                localField: "_id",
                foreignField: "articleId",
                as: "social"
            }
        },
        {
            $unwind: {
                path: "$social",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $project: {
                newsName: 1,
                content: 1,
                images: 1,
                videos: 1,
                language: 1,
                tags: 1,
                status: 1,
                createdAt: 1,

                reporter: {
                    _id: "$reporter._id",
                    fullName: "$reporter.fullName",
                    location: "$reporter.location"
                },

                category: {
                    _id: "$category._id",
                    catName: "$category.catName"
                },

                likesCount: {
                    $size: {
                        $ifNull: ["$social.likes", []]
                    }
                },

                dislikesCount: {
                    $size: {
                        $ifNull: ["$social.dislikes", []]
                    }
                },

                savesCount: {
                    $size: {
                        $ifNull: ["$social.saves", []]
                    }
                },

                commentsCount: {
                    $size: {
                        $ifNull: ["$social.comments", []]
                    }
                }
            }
        },

        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Articles fetched successfully",
            articles
        )
    );
});

// Get a single article by ID
export const getArticle = AsyncHandler(async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid article ID format");
    }

    const article = await Article.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },

        // Category
        {
            $lookup: {
                from: "categories",
                localField: "catId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        },

        // Social Data
        {
            $lookup: {
                from: "socials",
                localField: "_id",
                foreignField: "articleId",
                as: "social"
            }
        },
        {
            $unwind: {
                path: "$social",
                preserveNullAndEmptyArrays: true
            }
        },

        // Users by authId
        {
            $lookup: {
                from: "users",
                localField: "social.comments.userId",
                foreignField: "authId",
                as: "commentUsers"
            }
        },

        {
            $project: {
                newsName: 1,
                content: 1,
                status: 1,
                category: {
                    _id: "$category._id",
                    catName: "$category.catName"
                },

                likesCount: {
                    $size: {
                        $ifNull: ["$social.likes", []]
                    }
                },

                dislikesCount: {
                    $size: {
                        $ifNull: ["$social.dislikes", []]
                    }
                },

                savesCount: {
                    $size: {
                        $ifNull: ["$social.saves", []]
                    }
                },

                commentsCount: {
                    $size: {
                        $ifNull: ["$social.comments", []]
                    }
                },

                comments: {
                    $map: {
                        input: {
                            $ifNull: ["$social.comments", []]
                        },
                        as: "comment",
                        in: {
                            _id: "$$comment._id",
                            userId: "$$comment.userId",
                            comment: "$$comment.comment",
                            createdAt: "$$comment.createdAt",

                            fullName: {
                                $let: {
                                    vars: {
                                        matchedUser: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$commentUsers",
                                                        as: "user",
                                                        cond: {
                                                            $eq: [
                                                                "$$user.authId",
                                                                "$$comment.userId"
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: "$$matchedUser.fullName"
                                }
                            },

                            avatar: {
                                $let: {
                                    vars: {
                                        matchedUser: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$commentUsers",
                                                        as: "user",
                                                        cond: {
                                                            $eq: [
                                                                "$$user.authId",
                                                                "$$comment.userId"
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: "$$matchedUser.avatar"
                                }
                            }
                        }
                    }
                }
            }
        }
    ]);

    if (!article) {
        throw new ApiError(404, "Article not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Article fetched successfully", article)
    );
});

// Update an article by ID
export const updateArticle = AsyncHandler(async (req, res) => {

    const { id } = req.params;
    const { catId, newsName, content, images, videos } = req.body;
    const userRole = req.user.role

    if (![roleContaints.admin, roleContaints.reporter, roleContaints.editor].includes(userRole)) {
        throw new ApiError(403, "You are not Authorized to access this api");
    }

    const imageUploadData = parseUploadArray(req.files, "images");
    const videoUploadData = parseUploadArray(req.files, "videos");

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid article ID format");
        }

        const article = await Article.findById(id);
        if (!article) {
            throw new ApiError(404, "Article not found");
        }

        if (catId && !mongoose.Types.ObjectId.isValid(catId)) {
            throw new ApiError(400, "Invalid category ID format");
        }

        article.catId = catId ?? article.catId;
        article.newsName = newsName ?? article.newsName;
        article.content = content ?? article.content;
        article.status = req.body.status ?? article.status;

        if (imageUploadData && imageUploadData.length > 0) {
            article.images = imageUploadData;
        }

        if (videoUploadData && videoUploadData.length > 0) {
            article.videos = videoUploadData;
        }

        await article.save();
        return res.status(200).json(
            new ApiResponse(200, "Article updated successfully", article)
        );
    } catch (error) {
        if (imageUploadData?.length) {
            await Promise.all(
                imageUploadData.map((file) => {
                    fileDelete(file.path)
                })
            )
        }

        if (videoUploadData?.length) {
            await Promise.all(
                videoUploadData.map((file) => {
                    fileDelete(file.path)
                })
            )
        }

        return console.error(`Server error while update the Article, Error:${error}`)
    }
});

// Delete an article by ID
export const deleteArticle = AsyncHandler(async (req, res) => {
    const userRole = req.user.role
    const { id } = req.params;



    if (![roleContaints.admin, roleContaints.reporter].includes(userRole)) {
        throw new ApiError(403, "You are not Authorized to access this api");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid article ID format");
    }


    const article = await Article.findByIdAndDelete(id);
    if (!article) {
        throw new ApiError(404, "Article not found");
    }

    res.status(200).json(new ApiResponse(200, "Article deleted successfully", article));
});

export const searchArticles = AsyncHandler(async (req, res) => {
    const search = req.query.search;

    if (!search) {
        throw new ApiError(400, "Search keyword is required");
    }

    const articles = await Article.find({
        newsName: {
            $regex: search,
            $options: "i"
        }
    });

    return res.status(200).json(
        new ApiResponse(200, "Articles fetched successfully", articles)
    );
});

export const createHashtag = AsyncHandler(async (req, res) => {
    const { tags } = req.body;
    const { articleId } = req.params;

    if (!tags) {
        throw new ApiError(400, 'Tag is required')
    }

    const newtag = tags.split(' ')





})

/**
 * FETCHED ALL THE TAGS
 */

export const getTags = AsyncHandler(async (req, res) => {

    const result = await Article.aggregate([
        {
            $unwind: "$tags"
        },
        {
            $group: {
                _id: null,
                tags: {
                    $addToSet: "$tags"
                }
            }
        }
    ]);

    const tags = result[0]?.tags || [];

    return res.status(200).json(
        new ApiResponse(
            200,
            "Tags fetched successfully",
            { tags }
        )
    );
});
