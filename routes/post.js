const express = require("express");
const router = express.Router();
const { validatePost, isLoggedIn, isOwner} = require("../middlewares");
const controllers = require("../controllers/post");

router.route("/").get(isLoggedIn, controllers.index).post(isLoggedIn, validatePost, controllers.createPost)

router.get("/new", isLoggedIn, controllers.renderNewPostForm)

router.post("/:id/like", isLoggedIn, controllers.likePost);

router.route("/:id").get(isLoggedIn, controllers.showPost).put(isLoggedIn, isOwner, validatePost, controllers.updatePost).delete(isLoggedIn, isOwner, controllers.destroyPost);

router.get("/:id/edit", isLoggedIn, isOwner, controllers.renderEditForm)

module.exports = router;