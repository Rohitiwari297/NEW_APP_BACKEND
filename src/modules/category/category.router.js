import express from 'express'
import { createCategory, getCategory, updateCategory } from './category.controller.js';
import upload from '../../middleware/uploadMiddleware.js'

const category = express.Router();

category.route('/')
    .get(getCategory)
    .post(upload.single('avitar'), createCategory)

category.route('/:catId')
    .patch(upload.single('avitar'), updateCategory);

export default category;

