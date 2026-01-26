const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ১. সাইন আপ
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'এই নাম আগেই নেওয়া হয়েছে' });

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'একাউন্ট তৈরি সফল!', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'সার্ভার এরর' });
    }
});

// ২. লগিন
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'ইউজার পাওয়া যায়নি' });
        if (password !== user.password) return res.status(400).json({ message: 'পাসওয়ার্ড ভুল হয়েছে' });

        res.json({ message: 'লগিন সফল!', user: user });
    } catch (error) {
        res.status(500).json({ message: 'সার্ভার এরর' });
    }
});

// ৩. ডিপোজিট
router.post('/deposit', async (req, res) => {
    try {
        const { username, amount } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'ইউজার পাওয়া যায়নি' });

        user.balance += Number(amount);
        await user.save();
        res.json({ message: 'টাকা জমা হয়েছে! ✅', newBalance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'সার্ভার এরর' });
    }
});

// ৪. গেম (সাথে হিস্ট্রি সেভ করা) 🔥
router.post('/game/toss', async (req, res) => {
    try {
        const { username, amount, choice } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        if (amount < 10) return res.status(400).json({ message: 'ন্যূনতম ১০ টাকা বাজি ধরতে হবে!' });
        if (user.balance < amount) return res.status(400).json({ message: 'আপনার একাউন্টে পর্যাপ্ত টাকা নেই!' });

        const tossResult = Math.random() < 0.5 ? 'Head' : 'Tail';
        const isWin = (choice === tossResult);
        
        if (isWin) {
            user.balance += Number(amount);
        } else {
            user.balance -= Number(amount);
        }

        // 🔥 নতুন: হিস্ট্রিতে রেকর্ড যোগ করা হচ্ছে
        user.history.unshift({
            result: `You chose ${choice}, Result ${tossResult}`,
            amount: amount,
            isWin: isWin
        });
        
        // হিস্ট্রি যদি ১০টার বেশি হয়ে যায়, তবে পুরানোগুলো ডিলিট করে দিবো
        if(user.history.length > 10) {
            user.history.pop();
        }

        await user.save();

        res.json({ 
            message: isWin ? 'অভিনন্দন! আপনি জিতেছেন 🎉' : 'ইশ! আপনি হেরেছেন 😢', 
            result: tossResult,
            newBalance: user.balance,
            isWin: isWin,
            history: user.history // আপডেট করা হিস্ট্রি ফ্রন্টএন্ডে পাঠালাম
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;