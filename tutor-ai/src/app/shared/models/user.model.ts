import { UserRoles } from "../enums/UserRoles";

export interface IUserResponse {
    id: number;
    name: string;
    email: string;
    role: UserRoles;
    isActive: boolean;
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
    isActive?: boolean;
    password?: string;
    bio?: string;
}