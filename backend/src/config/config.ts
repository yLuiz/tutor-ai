import dotenv from 'dotenv';
dotenv.config();

const {
  MONGO_INITDB_ROOT_USERNAME,
  MONGO_INITDB_ROOT_PASSWORD,
  MONGO_HOST = 'localhost',
  MONGO_PORT = '27017',
  MONGO_DB_NAME = 'tutor_ia',
} = process.env;

const CONFIG = {
    IS_PROD: process.env.MODE === 'prod',
    PORT: process.env.PORT || 3000,
    CORRECT_BY_AI: Number(process.env.CORRECT_BY_AI) === 1 ? true : false || false,
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
    MONGO_URI: `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`,
    MONGO_DB_NAME: MONGO_DB_NAME,
}

export { CONFIG };