dotenv = require('dotenv');
dotenv.config();

const CONFIG = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/mydatabase',
    JWT_SECRET: process.env.JWT_SECRET
}

module.exports = CONFIG;