import express from 'express'
import { createCategory, deleteCategory, getCategory, updateCategory } from './category.controller.js';
import upload from '../../middleware/uploadMiddleware.js'

const category = express.Router();

category.route('/')
    .get(getCategory)
    .post(upload.single('avitar'), createCategory)

category.route('/:catId')
    .patch(upload.single('avitar'), updateCategory)
    .delete(deleteCategory)

export default category;

