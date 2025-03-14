const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const SECRET_KEY = 'your-secret-key'; // Replace with a strong secret key

// Encryption function (AES-256-GCM)
function encrypt(text) {
    const iv = crypto.randomBytes(12); // Unique IV for each encryption
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from('32-byte-long-key-for-aes-256-gcm'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted, authTag };
}

// Decryption function
function decrypt(encryptedData, iv, authTag) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from('32-byte-long-key-for-aes-256-gcm'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Signup
router.post('/signup', async (req, res) => {
    const {
        username, password, name, age, gender, pastMedicalIssues, existingIllnessesAllergies,
        phoneNumber, email, cityOfResidence, height, weight
    } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const bmi = weight / (height * height);

        // Encrypt sensitive fields
        const encryptedName = encrypt(name);
        const encryptedAge = encrypt(age.toString());
        const encryptedGender = encrypt(gender);
        const encryptedPastMedicalIssues = pastMedicalIssues ? encrypt(pastMedicalIssues) : null;
        const encryptedExistingIllnesses = existingIllnessesAllergies ? encrypt(existingIllnessesAllergies) : null;
        const encryptedPhone = encrypt(phoneNumber);
        const encryptedEmail = encrypt(email);
        const encryptedCity = encrypt(cityOfResidence);
        const encryptedHeight = encrypt(height.toString());
        const encryptedWeight = encrypt(weight.toString());

        const user = new User({
            username,
            password: hashedPassword,
            name: encryptedName.encryptedData,
            age: encryptedAge.encryptedData,
            gender: encryptedGender.encryptedData,
            pastMedicalIssues: encryptedPastMedicalIssues?.encryptedData,
            existingIllnessesAllergies: encryptedExistingIllnesses?.encryptedData,
            phoneNumber: encryptedPhone.encryptedData,
            email: encryptedEmail.encryptedData,
            cityOfResidence: encryptedCity.encryptedData,
            height: encryptedHeight.encryptedData,
            weight: encryptedWeight.encryptedData,
            bmi, // Not encrypted
            iv: Buffer.from(encryptedName.iv, 'hex'), // Store one IV (simplified; ideally store per field)
            role: username === 'PP_ADMIN' ? 'admin' : 'user'
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

module.exports = router;