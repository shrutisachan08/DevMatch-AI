const express = require("express");
const router = express.Router({mergeParams: true});
const { isLoggedIn } = require("../middlewares");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
const controllers = require("../controllers/profile")

router.route("/").get(isLoggedIn, controllers.userProfile).patch(isLoggedIn, controllers.addRemoveFollow).put(isLoggedIn, upload.single("user[image]"), controllers.updateUserProfile);

router.get("/following",isLoggedIn, controllers.getFollowings);

router.get("/follower",isLoggedIn, controllers.getFollowers);

router.get("/edit",isLoggedIn, controllers.renderUpdateForm);


module.exports = router;