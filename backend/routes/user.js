const express = require("express");
const zod = require('zod');
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const router = express.Router();

// ------------------- SIGNUP -------------------
const signUpBody = zod.object({
    userName: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string() 
});

router.post("/signup", async (req, res) => {
    const { success, data } = signUpBody.safeParse(req.body);
    if (!success) return res.status(400).json({ msg: "Incorrect credentials" });

    const existingUser = await User.findOne({ userName: data.userName });
    if (existingUser) return res.status(400).json({ msg: "Username already taken" });

    const user = await User.create(data);
    await Account.create({ userId: user._id, balance: 1 + Math.random() * 10000 });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ msg: "User created successfully", token });
});

// ------------------- SIGNIN -------------------
const signinBody = zod.object({
    userName: zod.string(),
    password: zod.string()
});

router.post("/signin", async (req, res) => {
    const { success, data } = signinBody.safeParse(req.body);
    if (!success) return res.status(400).json({ msg: "Incorrect credentials" });

    const user = await User.findOne({
        userName: data.userName,
        password: data.password
    });

    if (!user) return res.status(400).json({ msg: "Invalid username or password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// ------------------- UPDATE USER -------------------
const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
});

router.put('/', authMiddleware, async (req, res) => {
    const { success, data } = updateBody.safeParse(req.body);
    if (!success) return res.status(400).json({ msg: "Error while updating" });

    // Prevent updating _id
    if (data._id) delete data._id;

    const result = await User.updateOne(
        { _id: req.userId },
        { $set: data }
    );

    res.json({
        msg: "Update successful",
        modifiedCount: result.modifiedCount
    });
});

// ------------------- BULK SEARCH -------------------
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } }
        ]
    });

    res.json({
        users: users.map(user => ({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

// ------------------- DELETE USER BY ID -------------------
router.delete("/:id", authMiddleware, async (req, res) => {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    await Account.deleteOne({ userId }); // delete associated account
    res.json({ msg: "User deleted successfully", userId });
});

module.exports = router;
