const jwt = require('jsonwebtoken');
const config = require('../../config/config');


function createJwtToken(user) {

    // Create a JWT token with user information
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        config.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1
    );

    return token;
}

module.exports = { createJwtToken };