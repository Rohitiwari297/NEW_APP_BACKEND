import { Router } from 'express'
import { isLoggedIn } from '../../middleware/authMiddleware.js'
import { commentOnArticle, dislikeArticle, getSavedArticles, getSocialDetails, likeArticle, saveArticle } from './socialMedia.controller.js'

const social = Router()
social.route("/saved")
    .get(isLoggedIn, getSavedArticles);

social.route('/:articleId')
    .get(isLoggedIn, getSocialDetails)
    .post(isLoggedIn, likeArticle)

social.route('/:articleId/dislike')
    .post(isLoggedIn, dislikeArticle);

social.route('/:articleId/comment')
    .post(isLoggedIn, commentOnArticle);


social.route('/:articleId/save')
    .post(isLoggedIn, saveArticle)



export default social;