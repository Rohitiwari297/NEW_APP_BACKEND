import express from 'express';
import upload from '../../middleware/uploadMiddleware.js';
import { createArticle, getArticles, getArticle, updateArticle, deleteArticle } from './article.controller.js';
import { isLoggedIn } from '../../middleware/authMiddleware.js';

const article = express.Router();

// CREATE INSTANCE OF UPLOADS
const articleUploads = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 10 },
]);

article.route('/')
    .post(isLoggedIn, articleUploads, createArticle)
    .get(isLoggedIn, getArticles);

article.route('/:id')
    .get(getArticle)
    .patch(articleUploads, updateArticle)
    .delete(deleteArticle);

export default article;
