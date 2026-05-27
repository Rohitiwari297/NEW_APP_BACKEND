import express from "express";
import { getProfile } from "./user.controller.js";

const user = express.Router();

user.route("/")
    .get(getProfile);

export default user;