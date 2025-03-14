const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
const path = require('path'); // Add this for file paths
const connectDB = require("./db");

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your-secret-key';

async function startServer(){
    const db = await connectDB();

    app.get("/", async (req, res) => {
        const collection = db.collection("pillpal");
        const data = await collection.find().toArray();
        res.json(data);
    });

    app.listen(port, () => {
        console.log('Server running');
    });
}

mongoose.connect('mongodb://localhost/pillpal', { useNewUrlParser: true, useUnifiedTopology: true });

const twilioClient = twilio('ACCOUNT_SID', 'AUTH_TOKEN');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'your-email@gmail.com', pass: 'your-password' }
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

function decrypt(encryptedData, iv, authTag = 'default-auth-tag') {
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from('32-byte-long-key-for-aes-256-gcm'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Existing API routes
app.use('/api/auth', authRoutes);
app.get('/api/stats', authenticate, async (req, res) => { /* ... */ });
app.get('/api/records', authenticate, async (req, res) => { /* ... */ });
app.post('/api/appointments', authenticate, async (req, res) => { /* ... */ });
app.get('/api/records/pdf', authenticate, async (req, res) => { /* ... */ });
app.post('/api/documents', authenticate, async (req, res) => { /* ... */ });
app.get('/api/notifications', authenticate, (req, res) => { /* ... */ });
app.get('/api/records/search', authenticate, async (req, res) => { /* ... */ });
app.get('/api/admin/users', authenticate, async (req, res) => { /* ... */ });

app.listen(3000, () => console.log('Server running on port 3000'));

startServer();