if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const ExpressError = require("./utility/ExpressError");
const Post = require("./models/posts");
const { getEmbedding, cosine } = require("./utility/AI");
const postEmbeddingsCache = new Map();
//const mode = req.query.type || "article";
//const fetch = require("node-fetch");
const PORT = 8080;
const db = process.env.MONGO_ATLAS;

/* ================= DB CONNECT ================= */
mongoose.connect(db)
.then(() => console.log("DB Connected Successfully"))
.catch(err => console.error(err));

/* ================= SESSION STORE ================= */
const store = MongoStore.create({
    mongoUrl: db,
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR", err);
});

app.use(session({
    store,
    secret: "thisIsADevSecret", // fine for local
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}));

/* ================= GLOBAL MIDDLEWARE ================= */
app.use(flash());

app.use((req, res, next) => {
    res.locals.currUser = req.session.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
    res.redirect("/posts");
});

app.get("/explore", async (req, res) => {
    try {
        const user = req.session.user || { bio: "developer" };
        let posts = await Post.find({});

        // User vector for matching DB posts
        const userVec = await getEmbedding(user.bio || "developer");

        // Determine mode: article | github
        const mode = (req.query.type || req.query.q || "article").toLowerCase();
        console.log("REQ QUERY:", req.query);
        console.log("EXPLORE MODE:", mode);

        let feed = [];

        // If DB is empty → fetch live content
        if (posts.length === 0) {

            // ----------------- Articles -----------------
            if (mode === "article") {
                const response = await fetch("https://dev.to/api/articles?per_page=15");
                const data = await response.json();

                for (let a of data) {
                    const content = `${a.title} - ${a.description || ""}`;
                    const postVec = await getEmbedding(content);
                    const score = cosine(userVec, postVec);

                    feed.push({
                        type: "article",
                        title: a.title,
                        description: a.description || "",
                        url: a.url,
                        matchScore: Math.round(score * 100),
                    });
                }
            }

            // ----------------- GitHub -----------------
            if (mode === "github") {
                // Use typed search query if present, else fallback to user.bio
                const searchTerm = (req.query.q || user.bio || "developer").trim();

                const userIntent = `
                    ${user.bio}
                    ${user.skills?.join(", ") || ""}
                    ${user.interests?.join(", ") || ""}
                `;
                const userVec = await getEmbedding(userIntent);

                // Search in name, description, and readme for better results
                const repoQuery = `${searchTerm} in:name,description,readme stars:>5`;

                const ghRes = await fetch(
                    `https://api.github.com/search/repositories?q=${encodeURIComponent(repoQuery)}&per_page=15`,
                    {
                        headers: {
                            "User-Agent": "DevConnect-App",
                            "Accept": "application/vnd.github+json",
                            "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
                        },
                    }
                );

                if (!ghRes.ok) {
                    console.error("GitHub API error:", ghRes.status, await ghRes.text());
                } else {
                    const ghData = await ghRes.json();

                    for (let repo of ghData.items || []) {
                        const repoContent = `
                            ${repo.name}
                            ${repo.description || ""}
                            Language: ${repo.language}
                            Stars: ${repo.stargazers_count}
                        `;
                        const repoVec = await getEmbedding(repoContent); // ✅ await added
                        const similarity = cosine(userVec, repoVec);

                        const starBoost = Math.min(repo.stargazers_count / 5000, 0.1);
                        const matchScore = Math.round(Math.min(similarity + starBoost, 1) * 100);

                        feed.push({
                            type: "github",
                            repoName: repo.full_name,
                            description: repo.description,
                            url: repo.html_url,
                            language: repo.language,
                            stars: repo.stargazers_count,
                            matchScore,
                        });
                    }
                }
            }

            feed.sort((a, b) => b.matchScore - a.matchScore);

            return res.render("explore.ejs", {
                posts: feed.slice(0, 6),
                isDemo: true
            });
        }

        // ----------------- Normal DB posts flow -----------------
        for (let p of posts) {
            const postVec = await getEmbedding(p.content);
            const score = cosine(userVec, postVec);
            p.matchScore = Math.round(score * 100);
        }

        posts.sort((a, b) => b.matchScore - a.matchScore);
        res.render("explore.ejs", { posts, isDemo: false });

    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load explore feed.");
        res.redirect("/posts");
    }
});
app.use("/", userRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:id/comment", commentRoutes);
app.use("/profile/:username", profileRoutes);
app.use("/messages",require("./routes/messages"))

/* ================= ERROR HANDLING ================= */
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).render("error.ejs", { message: err.message });
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
    console.log(`PORT is running on ${PORT}`);
});
