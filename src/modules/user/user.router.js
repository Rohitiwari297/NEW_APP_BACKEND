import express from "express";
import { getAllUsers, getProfile, updateProfile, updateUserStatus } from "./user.controller.js";
import { isLoggedIn } from "../../middleware/authMiddleware.js";
import upload from '../../middleware/uploadMiddleware.js'

const user = express.Router();

user.route("/")
    .get(isLoggedIn, getProfile)
    .patch(isLoggedIn, upload.single('avitar'), updateProfile);

user.route("/all")
    .get(isLoggedIn, getAllUsers);

user.route("/status/:id")
    .patch(isLoggedIn, updateUserStatus);

export default user;