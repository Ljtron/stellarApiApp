const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema ({
    name: { type: String, required: true },
    email: {type: String, required:true},
    publicKey: { type: String, required: true },
    secretKey: { type: String, required: true },
});

module.exports = mongoose.model('User', User)