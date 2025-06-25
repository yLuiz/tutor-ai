import { getModelForClass, prop } from '@typegoose/typegoose';

export class User {
    @prop({ required: true })
    name!: string;

    @prop({ required: true, unique: true })
    email!: string;

    @prop({ required: true })
    password!: string;

    @prop({ enum: ['admin', 'common'], default: 'common' })
    role!: 'admin' | 'common';

    @prop()
    bio?: string;

    @prop({ default: true })
    isActive!: boolean;

    @prop({ default: () => new Date() })
    lastAccess!: Date;

    @prop({ default: 0 })
    correctedTexts!: number;
}

export const UserModel = getModelForClass(User);
export type UserDocument = InstanceType<typeof UserModel>;

export const UserRoles = {
    ADMIN: 'admin',
    COMMON: 'common'
}