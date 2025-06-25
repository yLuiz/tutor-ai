import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config/config';


interface JwtUser {
    id: string | number;
    email: string;
    role: string;
}

export function createJwtToken(user: JwtUser) {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        CONFIG.JWT_SECRET,
        { expiresIn: CONFIG.JWT_EXPIRATION as any }
    );

    return token;
}