const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoute = require('./routes/auth');

app.use(cors());
app.use(express.json());

// 🔥 ডাটাবেস কানেকশন (স্মার্ট পদ্ধতি)
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bettingProDB';

mongoose.connect(dbURI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ Connection Error:', err));

app.use('/api', authRoute);

app.get('/', (req, res) => {
    res.send('Imrul Boss, Server is Ready and DB Connected!');
});

// সার্ভার পোর্ট (Render এর জন্য ডাইনামিক পোর্ট জরুরি)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});