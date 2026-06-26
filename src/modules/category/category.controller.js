import AsyncHandler from '../../utils/AsyncHandler.js'
import ApiError from '../../utils/ApiErrorHandler.js'
import Category from '../../models/category.model.js'
import { fileDelete } from '../../utils/FileDelete.js'
import ApiResponse from '../../utils/ApiRespinseHandler.js'
import mongoose from 'mongoose'
import path from 'path'


export const createCategory = AsyncHandler(async (req, res) => {
    console.log('req.body', req.body)
    const { catName, discription } = req.body;
    if (!catName) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'Category Name is required')
    };

    const isDuplicateCategory = await Category.findOne({
        catName
    })
    if (isDuplicateCategory) {
        fileDelete(req.file?.path)
        throw new ApiError(409, "Category already exists");
    }

    const image = req.file?.path || '';
    const result = `uploads\\${path.basename(image)}`;

    const newCate = await Category.create({
        catName,
        discription,
        image: result
    })

    res.status(201).json(
        new ApiResponse(201, 'Category created successfully!', newCate)
    )
});

export const updateCategory = AsyncHandler(async (req, res) => {
    const { catName, discription } = req.body;
    const { catId } = req.params;

    if (!catId) {
        fileDelete(req.file?.path)
        throw new ApiError(400, 'Category id missing in params')
    }

    const isCatIdVaid = await Category.findById(catId)
    if (!isCatIdVaid) {
        throw new ApiError(400, 'Invalid Category id ')
    }

    const image = req.file?.path
    const result = `uploads\\${path.basename(image)}`;

    isCatIdVaid.catName = catName ?? isCatIdVaid.catName;
    isCatIdVaid.discription = discription ?? isCatIdVaid.discription;
    isCatIdVaid.image = result ?? isCatIdVaid.image

    await isCatIdVaid.save();

    res.status(200).json(
        new ApiResponse(200, 'Category updated successfully')
    )
});

export const getCategory = AsyncHandler(async (req, res) => {
    const queryObj = {}
    if (req.query.catId) {
        console.log('CatIdStatus:', mongoose.Types.ObjectId.isValid(req.query.catId))

        // Validation: Check karein ki ID valid MongoDB ID hai ya nahi
        if (!mongoose.Types.ObjectId.isValid(req.query.catId)) {
            throw new ApiError(400, 'Invalid Category ID format')
        }
        queryObj._id = req.query.catId;
    }

    const category = await Category.find(queryObj)

    if (category.length > 0) {
        return res.status(200).json(
            new ApiResponse(200, 'Category feched successfully', category)
        )
    } else {
        return res.status(200).json(
            new ApiResponse(200, 'Empty Category table', [])
        )
    }
})

export const deleteCategory = AsyncHandler(async (req, res) => {
    const { catId } = req.params;

    if (!catId) {
        throw new ApiError(400, "Category id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(catId)) {
        throw new ApiError(400, "Invalid Category id");
    }

    const deletedCategory = await Category.findByIdAndDelete(catId);

    if (!deletedCategory) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            "Category deleted successfully",
            deletedCategory
        )
    );
});

