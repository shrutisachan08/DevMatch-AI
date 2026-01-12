if (process.env.NODE_ENV !== "production") {
    const dotenv = require("dotenv").config();
}
const express = require("express");
const app = express();
const ejs = require("ejs");
const PORT = 8080;
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require('express-session');
const flash = require("connect-flash");
const db = process.env.MONGO_ATLAS;
const MongoStore = require('connect-mongo');
const mongoStoreSecret = "fdflkasdfosfdlkfsldfkjsldkfsdfflsdjfslk"
const postRoutes = require("./routes/post")
const commentRoutes = require("./routes/comment");
const ExpressError = require("./utility/ExpressError");
const userRoutes = require("./routes/user")
const profileRoutes = require("./routes/profile")

const store = MongoStore.create({
    mongoUrl: db,
    touchAfter: 24 * 3600, // time period in seconds
    crypto: {
      secret: mongoStoreSecret,
    }
  })

const sessionOption = {
    store: store,
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    }
}
app.use(session(sessionOption))

app.use(flash());

app.use((req, res, next) => {
    res.locals.currUser = req.session.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

main().then(() => {
    console.log(`DB Connected Successfully`)
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect(db);
}


app.get("/", (req, res) => {
    res.redirect("/posts")
})

//All Routes
app.use("/", userRoutes)
app.use("/posts", postRoutes);
app.use("/posts/:id/comment", commentRoutes);
app.use("/profile/:username/", profileRoutes)

// Catch-all for unmatched routes
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

//Error Handling Middleware
app.use((err, req, res, next) => {
    console.log(err)
    const statusCode = err.statusCode || 500;
    const message = err.message || "Some Error Occurred";
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(PORT, () => {
    console.log(`PORT is runing on ${PORT}`)
})