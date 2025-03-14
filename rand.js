const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

PORT = 5000;

DB_URL = 'mongodb://localhost:27017/';

mongoose.connect(DB_URL);
const conn = mongoose.connection;

conn.once('open', () => {
    console.log('successfully database connected');
})
conn.on('error', () => {
    console.log('error connecting to database');
    process.exit;
})