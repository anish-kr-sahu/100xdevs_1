const mongoose = require("mongoose"); // mongoose library -ODM ( Object Document mapping ) tool for mongoDB
mongoose.connect("mongodb://localhost:27017/db-paytm");

// Schema defined ( userSchema = Schema object)
const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 5,
        maxLength: 15
    },
    password: {
        type: String,
        required: true,
        minLegnth: 5,
        maxLength: 10
    },
    firstName: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 10
    },
    lastName: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 10
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model("Account",accountSchema);

// model create : A function which provides method to interact with database.
const User = mongoose.model("User",userSchema);

module.exports= {
    User,
    Account
};

