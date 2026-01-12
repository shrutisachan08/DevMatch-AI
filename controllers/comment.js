const Comment = require("../models/comments");
const Post = require("../models/posts");
const User = require("../models/users");
const { asyncWrapper } = require("../utility/asyncWrapper");

module.exports.createComment = asyncWrapper(async (req, res) => {
    let { id } = req.params;
    let { comment } = req.body;

    let newComment = new Comment({ ...comment, author: req.session.user });

    let svdComment = await newComment.save();

    if (svdComment) {
        // Push comment reference into Post's comments array
        let updatedPost = await Post.findByIdAndUpdate(id, { $push: { comments: svdComment._id } });

        req.flash("success", "Comment Created Successfully");
    } else {
        req.flash("error", "Error while Creating Comment");
    }

    res.redirect(`/posts/${id}`);
});

module.exports.destroyComment = asyncWrapper(async (req, res) => {
    let { id, commentId } = req.params;
    // 1. Delete the comment
    let comment = await Comment.findByIdAndDelete(commentId);
    // 2. Pull the comment reference from post
    const post = await Post.findByIdAndUpdate(id, {
        $pull: { comments: commentId }
    });
    req.flash("success", "Comment Deleted Successfully!");
    res.redirect(`/posts/${id}`);
})