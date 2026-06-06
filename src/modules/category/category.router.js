import express from 'express'
import { createCategory, getCategory, updateCategory } from './category.controller.js';

const category = express.Router();

category.route('/')
    .get(getCategory)
    .post(createCategory)
    .patch(updateCategory)

export default category;

