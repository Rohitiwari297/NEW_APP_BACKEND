import mongoose from 'mongoose';
import { roleContaints } from '../validators/constaints.js'
import { validateName } from '../validators/validators.js';

// user.schema.js
const UserSchema = new mongoose.Schema({
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, "Name must be at least 3 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"],
        validator: validateName,
    },
    phone: String,
    avitar: String,
    role: {
        type: String,
        enum: [roleContaints.user, roleContaints.admin, roleContaints.reporter],
        default: roleContaints.user,
    },
    location: {
        type: String
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;