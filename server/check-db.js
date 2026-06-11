const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_sharing');
        const users = await User.find({}, 'username name role');
        console.log(JSON.stringify(users, null, 2));
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUsers();
