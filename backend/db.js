const mongoose = require("mongoose"); // mongoose library -ODM ( Object Document mapping ) tool for mongoDB
mongoose.connect("");

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

// model create : A function which provides method to interact with database.
const User = mongoose.Model("User",userSchema);

module.exports= {
    User
};

