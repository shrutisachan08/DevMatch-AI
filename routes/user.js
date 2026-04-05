const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });
const express = require("express");
const router = express.Router();
const controllers = require("../controllers/user")
const user=require("../models/users")

router.route("/register").get(controllers.renderSignUpForm).post( controllers.signUpUser);

router.route("/login").get(controllers.renderLoginForm).post(controllers.loginUser);

router.post("/logout", controllers.logoutUser)

router.get("/all",async(req,res)=>{
    try{
        const use=await user.find({
            _id: { $ne: req.session.userId }
        });
          res.render("users/index", { use });
    }
    catch (err) {
        console.log(err);
        res.redirect("/posts");
    }
});

module.exports = router;