import { UserRoles } from "../enums/UserRoles";

export interface IUserResponse {
    id: number;
    name: string;
    email: string;
    role: UserRoles;
    isActive: number;
    lastAccess: string;
    bio?: string;
    correctedTexts: number;
}

export interface IUserProfile {
    id: number;
    name: string;
    email: string;
    bio?: string;
}

export interface IUserForm {
    id?: number;
    name: string;
    email: string;
    role?: string;
    isActive?: number;
    password?: string;
    bio?: string;
}