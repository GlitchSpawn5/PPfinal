const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    pastMedicalIssues: { type: String },
    existingIllnessesAllergies: { type: String },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    cityOfResidence: { type: String, required: true },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    bmi: { type: Number },
    iv: { type: Buffer },
    records: [{
        date: String,
        diagnosis: String,
        doctor: String,
        treatmentType: String, // Added
        severity: String       // Added
    }],
    appointments: [{ doctor: String, date: String, reason: String }],
    prescriptions: [{ name: String, dosage: String }],
    role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', UserSchema);