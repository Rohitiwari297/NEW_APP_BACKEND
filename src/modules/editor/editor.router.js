import express from "express";
import { editorGetArticles, editorGetArticle, editorUpdateArticle } from "./editor.controller.js";
import { isLoggedIn, isEditor } from "../../middleware/authMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

const editorRouter = express.Router();

// All editor routes require being logged in and having EDITOR role
editorRouter.use(isLoggedIn, isEditor);

editorRouter.route("/articles")
    .get(editorGetArticles);

editorRouter.route("/articles/:id")
    .get(editorGetArticle)
    .patch(upload.fields([
        { name: "images", maxCount: 10 },
        { name: "videos", maxCount: 5 }
    ]), editorUpdateArticle);

export default editorRouter;
