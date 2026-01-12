const Post = require("../models/posts");
const User = require("../models/users");
const { asyncWrapper } = require("../utility/asyncWrapper");

module.exports.userProfile = asyncWrapper(async (req, res) => {
    let { username } = req.params;

    // Get single user (findOne returns object not array)
    let user = await User.findOne({ username: username });

    // Get all posts with owner populated
    let posts = await Post.find().populate("owner");

    // Filter posts that belong to this user
    let userPosts = posts.filter((post) => {
        return post.owner._id.equals(user._id);
    });

    console.log(user);
    console.log(userPosts);

    res.render("profile/profile.ejs", { title: username, userProfile: user, posts: userPosts });
})

module.exports.addRemoveFollow = asyncWrapper(
    async (req, res) => {
        let { username } = req.params;

        let user = await User.findOne({ username: username });
        let userToFollow = await User.findById(user._id);

        // Get current logged-in user from session
        let sessionUser = res.locals.currUser;
        let currUser = await User.findOne({ username: sessionUser.username });

        // Check if already following
        let isFollowing = userToFollow.followers.includes(currUser._id);

        if (isFollowing) {
            userToFollow.followers = userToFollow.followers.filter(
                (followerId) => !followerId.equals(currUser._id)
            );
            await userToFollow.save();

            currUser.following = currUser.following.filter(
                (followingId) => !followingId.equals(userToFollow._id)
            );
            await currUser.save();
        } else {
            userToFollow.followers.push(currUser._id);
            await userToFollow.save();

            currUser.following.push(userToFollow._id);
            await currUser.save();
        }

        res.json({
            isFollowing: isFollowing // Tells frontend what was previous state
        });
    }
)

module.exports.getFollowings = asyncWrapper(
    async (req, res) => {
        let { username } = req.params;
        let user = await User.findOne({ username: username }).populate("following");
        let followings = user.following;
        res.render("profile/following.ejs", { followings })
    }
)

module.exports.getFollowers = asyncWrapper(async (req, res) => {
    let { username } = req.params;
    let user = await User.findOne({ username: username }).populate("followers");
    let followers = user.followers;
    res.render("profile/followers.ejs", { followers })
})

module.exports.renderUpdateForm = asyncWrapper(
    async (req, res) => {
        let { username } = req.params;
        let user = await User.findOne({ username: username })
        res.render("profile/editProfile.ejs", { user });
    }
)

module.exports.updateUserProfile = asyncWrapper(async (req, res) => {
    let { username } = req.params;
    let { user } = req.body;
    let $user = await User.findOne({ username: username })
    let userToUpdate = await User.findByIdAndUpdate($user._id, { ...user }, { new: true });

    if (req.file && req.file.path && req.file.filename) {
        userToUpdate.image = {
            filename: req.file.filename,
            url: req.file.path
        };
        await userToUpdate.save();
    }

    return res.redirect(`/profile/${userToUpdate.username}`);
})