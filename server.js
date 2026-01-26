const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// আমরা যে রাউট বানিয়েছি সেটা এখানে আনলাম
const authRoute = require('./routes/auth');

// মিডলওয়্যার
app.use(cors());
app.use(express.json());

// ডাটাবেস কানেকশন
mongoose.connect('mongodb://127.0.0.1:27017/bettingProDB')
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ Connection Error:', err));

// রাউট ব্যবহার করা (API Route)
app.use('/api', authRoute);

// হোম রাউট
app.get('/', (req, res) => {
    res.send('Imrul Boss, Server is Ready for Registration!');
});

// সার্ভার পোর্ট
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});