const User = require("../models/users");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/register.ejs", { title: "Sign Up Form" })
}

module.exports.signUpUser = async (req, res) => {
    let { user } = req.body;
    user.image = {
        filename: req.file.filename,
        url: req.file.path
    }
    let newUser = new User({ ...user });  // password will be auto-hashed
    let savedUser = await newUser.save();
    req.session.user = savedUser;
    req.flash("success", "Welcome to DevConnect!");
    res.redirect("/posts");
}

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