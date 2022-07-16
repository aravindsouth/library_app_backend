const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: String,
        password: String
    }
);

const userdata = mongoose.model('user', UserSchema);
module.exports = userdata;