import { getArticles, getArticle, updateArticle } from "../article/article.controller.js";

// Re-using article controller logic for editor module
export const editorGetArticles = getArticles;
export const editorGetArticle = getArticle;
export const editorUpdateArticle = updateArticle;
