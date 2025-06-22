import { IUserResponse } from "../models/user.model";
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 's3cr373K3y'; // idealmente em env

export class UserHelper {
    static getUserInfo(): IUserResponse | null {
        try {
            const encryptedData = localStorage.getItem('user');
            if (!encryptedData) return null;

            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            return JSON.parse(decryptedData) as IUserResponse;
        } catch (error) {
            console.error('Erro ao descriptografar os dados do usuário:', error);
            return null;
        }
    }

    static setUserInfo(user: IUserResponse): void {
        try {
            const userString = JSON.stringify(user);
            const encrypted = CryptoJS.AES.encrypt(userString, SECRET_KEY).toString();
            localStorage.setItem('user', encrypted);
        } catch (error) {
            console.error('Erro ao criptografar os dados do usuário:', error);
        }
    }

    static clearUserInfo(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}
