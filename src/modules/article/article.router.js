import express from 'express';
import upload from '../../middleware/uploadMiddleware.js';
import {
    createArticle,
    getArticles,
    getArticle,
    updateArticle,
    deleteArticle,
} from './article.controller.js';

const article = express.Router();

const articleUploads = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 10 },
]);

article.route('/')
    .post(articleUploads, createArticle)
    .get(getArticles);

article.route('/:id')
    .get(getArticle)
    .patch(articleUploads, updateArticle)
    .delete(deleteArticle);

export default article;
