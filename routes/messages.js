const express=require('express');
const router=express.Router();
const Message=require('../models/Message');
router.get('/',async(req,res)=>{
    const userId=req.session.userId
      const messages = await Message.find({
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  }).populate("sender receiver");
  const chatMap=new Map();
  messages.forEach(msg=>{
    const otherUser=msg.sender._id.toString()===userId.toString()?msg.receiver:msg.sender;
    chatMap.set(otherUser._id.toString(),{
        user:otherUser,
        lastmessage:msg.text
    });
  });
  const chats=Array.from(chatMap.values());
  res.render("message/inbox", { chats });
});

//chat page route
router.post("/send",async(req,res)=>{
    const{receiverId,text}=req.body;
    console.log("Sender:", req.session.userId);
    console.log("Receiver:", receiverId);
    await Message.create({
        sender:req.session.userId,
        receiver:receiverId,
        text
    });
    res.redirect("/messages/"+receiverId);
})
router.get("/:userId",async(req,res)=>{
    const currentUser=req.session.userId;
    const otherUser=req.params.userId;
    const messages=await Message.find({
        $or:[
            {sender:currentUser,receiver:otherUser},
            {sender:otherUser,receiver:currentUser}

        ]
    }).sort({createdAt:1})
    res.render("message/chat",{messages,otherUser,userId: currentUser});
})
module.exports = router;