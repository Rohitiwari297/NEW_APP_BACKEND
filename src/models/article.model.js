import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    catId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },

    language: {
        type: String,
        default: "English"
    },

    newsName: {
        type: String,
    },

    content: {
        type: String,
        required: [true, "News content is required"], // Khali content submit nahi hoga
        trim: true // Aage aur peeche ke faltu spaces (spaces/newlines) automatic hat jayenge
    },

    images: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                auto: true
            },

            public_id: {
                type: String,
                // required: true
            },

            url: {
                type: String,
                // required: true
            }
        }
    ],

    videos: [
        {

            // Mongoose _id apne aap bana dega, likhne ki zaroorat nahi hai as line imgages

            public_id: {
                type: String,
                required: [true, "Video public ID is required"]
            },
            url: {
                type: String,
                required: [true, "Video URL is required"]
            }
        }
    ],

    // slug: {
    //     type: String,
    //     // required: true,
    //     // unique: true,
    //     lowercase: true,
    //     trim: true
    // },

}, { timestamps: true });

const Article = mongoose.model("News", articleSchema);
export default Article;