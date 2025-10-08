const express = require("express");
const { default: mongoose } = require('mongoose');
const { Acoount } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();


router.get("/balance",authMiddleware, async (req,res)=>{
    const account = await Account.findOne({userId: req.userId});
    res.json({
        balance: account.balance
    })
});

router.post("/transfer",authMiddleware,async(req,res)=>{
    const going = await mongoose.startSession();
    going.startTransaction();
    const { amount , to } = req.body;
    const account = await Account.findOne({ userId: req.userId }).session(going);
    if(!account || account.balance < amount){
        await going.abortTransaction();
        return res.status(400).json({
            msg: "InSufficient balance"
        });
    } 
    const toAccount = await Account.findOne({userId: to}).session(going);
    if(!toAccount){
        await going.abortTransaction();
        return res.status(400).json({
            msg: "Invalid account"
        })
    }
    await Account.updateOne({ userId: req.userId},{$inc: {balance: -amount}});
    await Account.updateOne({ userId: to},{$inc: {balance: amount}});

    await going.commitTransaction();
    res.json({
        msg: "Transfer successfully"
    });
});

module.exports = router;




