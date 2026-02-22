const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: []
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

postSchema.virtual("likeCount").get(function () {
    return this.likes.length;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

postSchema.index({ owner: 1 });
postSchema.index({ createdAt: -1 });

const Post = model("Post", postSchema);
module.exports = Post;