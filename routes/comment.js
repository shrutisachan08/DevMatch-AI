const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateComment, isLoggedIn, isAuthor } = require("../middlewares");
const controllers = require("../controllers/comment")

//Create Comment 
router.post("/", isLoggedIn, validateComment, controllers.createComment);

router.delete("/:commentId", isLoggedIn, isAuthor, controllers.destroyComment);


module.exports = router;