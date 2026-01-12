const mongoose = require("mongoose");
const data = require("./data");
const Post = require("../models/posts");

main().then(() => {
    console.log(`DB Connected Successfully`)
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/devConnect');
};


const initDb = async () => {
    await Post.deleteMany();
    const updatedData = data.map(obj => ({
        ...obj,
        owner: '681792ee744634a8886aae2d',
        likes: '681792ee744634a8886aae2d'
    }));
    const allPosts = await Post.insertMany(updatedData);
    console.log(`Data intialized`);
    console.log(allPosts)
}

initDb()