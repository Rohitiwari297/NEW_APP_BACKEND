import express from "express";
import { getProfile, updateProfile } from "./user.controller.js";
import { isLoggedIn } from "../../middleware/authMiddleware.js";
import upload from '../../middleware/uploadMiddleware.js'

const user = express.Router();

user.route("/")
    .get(isLoggedIn, getProfile)
    .patch(isLoggedIn, upload.single('avitar'), updateProfile);

export default user;