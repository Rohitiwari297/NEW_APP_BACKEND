import express from 'express'
import { login, signup } from './auth.controller.js'
import upload from '../../middleware/uploadMiddleware.js';

const auth = express.Router()

auth.route('/signup')
    .post(upload.single('avitar'), signup);

auth.route('/login')
    .post(login);


export default auth;