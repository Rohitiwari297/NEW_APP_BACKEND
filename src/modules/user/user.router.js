import express from "express";
import { getProfile } from "./user.controller.js";
import { isLoggedIn } from "../../middleware/authMiddleware.js";

const user = express.Router();

user.route("/")
    .get(isLoggedIn, getProfile);

export default user;