import express from "express";
import { deleteUser, getAllUsers, getProfile, updateProfile, updateUserData, updateUserStatus } from "./user.controller.js";
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

user.route("/:id")
    .patch(isLoggedIn, updateUserData)
    .delete(isLoggedIn, deleteUser);

export default user;