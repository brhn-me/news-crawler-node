var mongoose = require('mongoose');

var linkSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    host: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Q', 'V'],
        required: true,
        default: 'Q'
    },
    created: {
        type: Date,
        required: true,
        default: Date.now
    },
    visited: {
        type: Date
    },
    attempt: {
        type: Number,
        required: true,
        default: 0
    },
    depth: {
        type: Number,
        required: true,
        default: 0
    },
    priority: {
        type: Number,
        required: true,
        default: 5
    },
    hash: {
        type: String,
        required: true,
        unique: true
    }
});

var Link = mongoose.model('Link', linkSchema);

module.exports = Link;
