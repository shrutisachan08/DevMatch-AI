const mongoose = require("mongoose");
const Comment = require("./comments")
const { Schema, model } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    likes: [
        {type: Schema.Types.ObjectId, ref: "User"}
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

const Post = model("Post", postSchema);
module.exports = Post;