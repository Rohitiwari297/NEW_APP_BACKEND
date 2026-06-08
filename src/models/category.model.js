import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    catName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    description: {
        type: String,
        trim: true,
    },

    image: {
        type: String,
    },

    slug: {
        type: String,
        // unique: true,
        lowercase: true,
    },

    status: {
        type: Boolean,
        default: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth"
    }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;