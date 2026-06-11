const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_sharing');
    const user = await User.findOne({ username: 'student1' });
    console.log(JSON.stringify(user, null, 2));
    mongoose.disconnect();
};
check();
