const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// ১. 🔥 CLOUD DATABASE CONNECTION (MANUAL LONG LINK)
// আপনার ক্লাস্টার আইডি: kgccq1x থেকে বানানো লিংক
const dbURI = 'mongodb://imrulkowser2017_db_user:MESRH58cE2pc9TAF@boss-shard-00-00.kgccq1x.mongodb.net:27017,boss-shard-00-01.kgccq1x.mongodb.net:27017,boss-shard-00-02.kgccq1x.mongodb.net:27017/betpro?ssl=true&authSource=admin';

mongoose.connect(dbURI)
    .then(() => console.log('✅ Cloud DB Connected Successfully!'))
    .catch(err => {
        console.error('❌ DB Connection Error:', err.message);
        console.log('👉 Tip: If this fails, your Internet is blocking MongoDB completely. Try switching to Mobile Data or VPN.');
    });

// গ্লোবাল সেটিংস
let ADMIN_WIN_RATE = 40; 

// মডেল
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

const TransactionSchema = new mongoose.Schema({
    username: String,
    amount: Number,
    type: String, // 'deposit' or 'withdraw'
    method: String,
    trxId: String,
    date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- ROUTES ---

app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User({ username: req.body.username, password: req.body.password });
        await newUser.save();
        res.json({ success: true, user: newUser });
    } catch (e) { res.json({ success: false, message: 'User exists' }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'boss123') {
        return res.json({ success: true, isAdmin: true, user: { username: 'Master Admin' } });
    }
    const user = await User.findOne({ username, password });
    if (!user) return res.json({ success: false, message: 'Wrong Info' });
    res.json({ success: true, isAdmin: false, user });
});

app.post('/api/play-game', async (req, res) => {
    const { username, betAmount } = req.body;
    const user = await User.findOne({ username });
    if (user.balance < betAmount) return res.json({ success: false, message: 'Low Balance!' });

    const luck = Math.floor(Math.random() * 100) + 1;
    let isWin = luck <= ADMIN_WIN_RATE;
    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '🔔'];
    let result = [];
    let winnings = 0;

    if (isWin) {
        const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        result = [winningSymbol, winningSymbol, winningSymbol];
        const multiplier = winningSymbol === '💎' ? 10 : 3;
        winnings = betAmount * multiplier;
        user.balance += winnings;
    } else {
        let s1 = symbols[Math.floor(Math.random() * symbols.length)];
        let s2 = symbols[Math.floor(Math.random() * symbols.length)];
        let s3 = symbols[Math.floor(Math.random() * symbols.length)];
        while (s1 === s2 && s2 === s3) s3 = symbols[Math.floor(Math.random() * symbols.length)];
        result = [s1, s2, s3];
        user.balance -= Number(betAmount);
    }
    await user.save();
    res.json({ success: true, user, result, isWin, winnings });
});

// Payments & Admin
app.post('/api/deposit/execute', async (req, res) => {
    try {
        const { username, amount, method } = req.body;
        const user = await User.findOne({ username });
        const realTrxID = 'DEP_' + Math.floor(Math.random() * 999999);
        user.balance += Number(amount);
        await user.save();
        await new Transaction({ username, amount, type: 'deposit', method, trxId: realTrxID }).save();
        res.json({ success: true, user, message: `Verified! TrxID: ${realTrxID}` });
    } catch (e) { res.json({ success: false, message: 'Error' }); }
});

app.post('/api/withdraw/execute', async (req, res) => {
    try {
        const { username, amount, method, number } = req.body;
        const user = await User.findOne({ username });
        if (user.balance < amount) return res.json({ success: false, message: 'Low Balance' });
        const realTrxID = 'WID_' + Math.floor(Math.random() * 999999);
        user.balance -= Number(amount);
        await user.save();
        await new Transaction({ username, amount, type: 'withdraw', method, trxId: realTrxID }).save();
        res.json({ success: true, user, message: `Sent to ${number}. TrxID: ${realTrxID}` });
    } catch (e) { res.json({ success: false, message: 'Error' }); }
});

app.get('/api/admin/data', async (req, res) => {
    const users = await User.find({});
    const transactions = await Transaction.find({}).sort({date: -1}).limit(20);
    res.json({ users, transactions, winRate: ADMIN_WIN_RATE });
});
app.post('/api/admin/set-rate', (req, res) => { ADMIN_WIN_RATE = req.body.rate; res.json({ success: true }); });
app.post('/api/admin/update-balance', async (req, res) => { const { username, amount } = req.body; const user = await User.findOne({ username }); user.balance += Number(amount); await user.save(); res.json({ success: true }); });
app.post('/api/admin/reset-password', async (req, res) => { const { username, newPassword } = req.body; await User.findOneAndUpdate({ username }, { password: newPassword }); res.json({ success: true }); });
app.post('/api/admin/delete-user', async (req, res) => { const { username } = req.body; await User.findOneAndDelete({ username }); await Transaction.deleteMany({ username }); res.json({ success: true }); });

app.listen(5000, () => console.log('🚀 Server Ready! Trying to connect DB...'));