import express from 'express'
import { createCategory, getCategory, updateCategory } from './category.controller';

const category = express.Router();

category.route('/')
    .post(createCategory)
    .patch(updateCategory)
    .get(getCategory);

