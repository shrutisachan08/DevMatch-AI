const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const bcrypt = require("bcrypt");
const { types, ref } = require("joi");

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    image: {
        filename: String,
        url: String
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();  // Only hash if password is new or modified
    const salt = await bcrypt.genSalt(12);  // 12 rounds is a solid standard
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to compare passwords during login
userSchema.methods.validatePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
