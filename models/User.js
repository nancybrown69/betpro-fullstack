const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    // হিস্ট্রি রাখার জন্য নতুন জায়গা
    history: [
        {
            result: String, // Head or Tail
            amount: Number, // কত টাকা
            isWin: Boolean, // জিতেছে নাকি হেরেছে
            date: { type: Date, default: Date.now } // কখন খেলেছে
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);