const User = require("../models/users");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/register.ejs", { title: "Sign Up Form" })
}

module.exports.signUpUser = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
  

    let { user } = req.body;

    /*if (!req.file) {
      req.flash("error", "Image upload failed");
      return res.redirect("/register");
    }

    user.image = {
      filename: req.file.filename,
      url: req.file.path
    };*/

    const newUser = new User(user);
    const savedUser = await newUser.save();

    req.session.user = savedUser;
    req.flash("success", "Welcome to DevConnect!");
    return res.redirect("/posts");

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.redirect("/register");
  }
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.loginUser = async (req, res) => {
    let { username, password } = req.body.user;
    let user = await User.findOne({ username });

    if (!user) {
        req.flash("error", "Invalid username or password.");
        return res.redirect("/login");
    }
    let isValid = await user.validatePassword(password);

    if (isValid) {
        req.session.userId = user._id; 
        req.session.user = user;
        req.flash("success", `Welcome back, ${username}!`);
        let path = req.session.redirectUrl || '/posts';
        res.redirect(`${path}`);
    } else {
        req.flash("error", "Invalid username or password.");
        res.redirect("/login");
    }
}

module.exports.logoutUser = (req, res) => {
    req.flash("success", "User Successfully logout")
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect("/posts");
        }
        res.clearCookie('connect.sid');
        res.redirect("/posts");
    });
}