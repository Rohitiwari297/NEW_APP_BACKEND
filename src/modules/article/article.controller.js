import AsyncHandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ApiErrorHandler.js";
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import Article from "../../models/article.model.js";
import mongoose from "mongoose";
import { fileDelete } from "../../utils/FileDelete.js";
import path from 'path'
import User from "../../models/user.model.js";

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

    console.log('req.body', req.body)
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
            createdBy: {
                name: user.fullName,
                location: user.location
            },
            newsName,
            content,
            tags: saparateTags,
            language: languageInCaps,
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
    const userId = req.userId;
    const query = {};

    if (req.query.catId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.catId)) {
            throw new ApiError(400, "Invalid category ID format");
        }
        query.catId = new mongoose.Types.ObjectId(req.query.catId);
    }

    if (req.query.lang) {
        query.language = req.query.lang; // Hindi, English, Tamil
    }
    const search = req.query.search;

    if (search) {

        query.newsName = {
            $regex: search,
            $options: "i"
        }
    }


    const articles = await Article.aggregate([
        {
            $match: query
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
                createdAt: 1,

                category: {
                    _id: "$category._id",
                    catName: "$category.catName"
                },

                isLiked: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        { $ifNull: ["$social.likes", []] }
                    ]
                },

                likesCount: {
                    $size: { $ifNull: ["$social.likes", []] }
                },

                dislikesCount: {
                    $size: { $ifNull: ["$social.dislikes", []] }
                },

                isDisliked: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        { $ifNull: ["$social.dislikes", []] }
                    ]
                },

                savesCount: {
                    $size: { $ifNull: ["$social.saves", []] }
                },

                isSaved: {
                    $in: [
                        new mongoose.Types.ObjectId(userId),
                        { $ifNull: ["$social.saves", []] }
                    ]
                },

                commentsCount: {
                    $size: { $ifNull: ["$social.comments", []] }
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
        new ApiResponse(200, "Articles fetched successfully", articles)
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
                title: 1,
                description: 1,

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
        article.images = imageUploadData ?? images ?? article.images;
        article.videos = videoUploadData ?? videos ?? article.videos;

        await article.save();
        return res.status(200).json(
            new ApiResponse(200, "Article updated successfully", article)
        );
    } catch (error) {
        if (imageUploadData.length) {
            await Promise.all(
                imageUploadData.map((file) => {
                    fileDelete(file.path)
                })
            )
        }

        if (videoUploadData.length) {
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
    const { id } = req.params;
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