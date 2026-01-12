const { postSchema, commentSchema } = require("./schema");
const ExpressError = require("./utility/ExpressError");
const Comment = require("./models/comments");
const Post = require("./models/posts");

module.exports.isLoggedIn = (req, res, next) => {
    req.session.redirectUrl = req.originalUrl;
    if (!req.session.user) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You are not logged In")
        return res.redirect("/login");
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    let { id, commentId } = req.params;
    let comment = await Comment.findById(commentId).populate("author");
    if (String(comment.author._id) !== req.session.user._id) {
        req.flash("error", "You are not the Owner of the Comment");
        return res.redirect(`/posts/${id}`);
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let post = await Post.findById(id).populate("owner");
    let owner = String(post.owner._id);
    let sessionUser = req.session.user._id;
    if (owner !== sessionUser) {
        req.flash("error", "You are not the Owner of the post");
        return res.redirect(`/posts/${id}`);
    }
    next();
}

module.exports.validatePost = (req, res, next) => {
    let { error } = postSchema.validate(req.body);
    if (error) {
        throw new ExpressError(error.details[0].message, 400)
    } else {
        next();
    }
}


module.exports.validateComment = (req, res, next) => {
    let { error } = commentSchema.validate(req.body);
    if (error) {
        throw new ExpressError(error.details[0].message, 400)
    } else {
        next();
    }
}