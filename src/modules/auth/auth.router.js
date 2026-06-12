import express from 'express'
import { login, resetpassword, signup } from './auth.controller.js'
import upload from '../../middleware/uploadMiddleware.js';
import { isLoggedIn } from '../../middleware/authMiddleware.js'

const auth = express.Router()

auth.route('/signup')
    .post(upload.single('avitar'), signup);

auth.route('/login')
    .post(login);

auth.route('/reset-password')
    .post(isLoggedIn, resetpassword);


export default auth;