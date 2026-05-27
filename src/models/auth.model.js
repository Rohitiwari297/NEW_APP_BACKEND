import mongoose from "mongoose";
import { validateEmail, validatePassword } from "../validators/validators.js";
import jwt from 'jsonwebtoken'
import config from '../config/config.js';

// auth.schema.js
const AuthSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validator: validateEmail
    },
    password: {
        type: String,
        required: true,
        validator: validatePassword
    },
    refreshToken: String,
});

AuthSchema.methods.generateAccessToken = function (user) {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,

            role: user.role,
        },
        config.ACCESS_TOKEN_SECRET,
        {
            expiresIn: config.ACCESS_TOKEN_EXPIRY
        }
    )
}

const Auth = mongoose.model("Auth", AuthSchema);
export default Auth;