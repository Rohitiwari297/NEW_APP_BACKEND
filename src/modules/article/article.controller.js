import AsyncHandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ApiErrorHandler.js";
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import Article from "../../models/article.model.js";
import mongoose from "mongoose";
import { fileDelete } from "../../utils/FileDelete.js";

const parseUploadArray = (files, fieldName) => {
    if (!files?.[fieldName]) return undefined;
    return files[fieldName].map((file) => ({
        public_id: file.filename,
        url: file.path,
    }));
};

// Create a new article
export const createArticle = AsyncHandler(async (req, res) => {
    const { catId, newsName, content, images, videos } = req.body;

    const imageUploadData = parseUploadArray(req.files, "images");
    const videoUploadData = parseUploadArray(req.files, "videos");

    try {
        if (!content) {
            throw new ApiError(400, "News content is required");
        }

        if (catId && !mongoose.Types.ObjectId.isValid(catId)) {
            throw new ApiError(400, "Invalid category ID format");
        }

        const newArticle = await Article.create({
            catId,
            newsName,
            content,
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
    const query = {};

    if (req.query.catId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.catId)) {
            throw new ApiError(400, "Invalid category ID format");
        }
        query.catId = req.query.catId;
    }

    const articles = await Article.find(query)
        .populate("catId", "catName");

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

    const article = await Article.findById(id).populate("catId", "catName");
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