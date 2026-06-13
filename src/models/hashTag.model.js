import mongoose from "mongoose";

const hashTagSchema = mongoose.Schema({
    tag: {
        type: String
    },
    articleId: {
        type: mongoose.Types.ObjectId,
        ref: 'News'
    }
}, {})