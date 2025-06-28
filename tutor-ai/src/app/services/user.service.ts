import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { IUserForm, IUserProfile, IUserResponse } from "../shared/models/user.model";
import { UserRoles } from "../shared/enums/UserRoles";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { environment } from "../../env/env.local";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private _http: HttpClient,
        private _authService: AuthService
    ) { }

    url = environment.apiUrl;
    sufix = '/users';

    private _getHeader() {
        return {
            'Authorization': `Bearer ${this._authService.getValidToken()}`,
        }
    }

    getUserById(id: number): Observable<IUserResponse | undefined> {
        return this._http.get<IUserResponse>(`${this.url}${this.sufix}/${id}`, {
            headers: this._getHeader()
        })
    }

    getUserByEmail(email: string): Observable<IUserResponse[] | undefined> {
        return this._http.get<IUserResponse[]>(`${this.url}${this.sufix}/?email=${email}`, {
            headers: this._getHeader()
        });
    }

    getUsers(filters?: { email?: string; name?: string }): Observable<IUserResponse[]> {
        const params: Record<string, string> = {};

        if (filters?.email) {
            params['email'] = filters.email;
        }

        if (filters?.name) {
            params['name'] = filters.name;
        }

        return this._http.get<IUserResponse[]>(`${this.url}${this.sufix}`, {
            headers: this._getHeader(),
            params,
        });
    }

    updatePassword(args: { id: number, oldPassword: string, newPassword: string }) {
        const { id, oldPassword, newPassword } = args;
        return this._http.patch<IUserResponse>(`${this.url}${this.sufix}/change-password/${id}`, {
            oldPassword,
            newPassword
        }, {
            headers: this._getHeader()
        });
    }

    updateUserById(args: { id: number, user: IUserForm }) {
        const { id, user } = args;
        return this._http.patch<IUserResponse>(`${this.url}${this.sufix}/${id}`, user, {
            headers: this._getHeader()
        });
    }

    createUser(user: IUserForm): Observable<IUserResponse> {
        return this._http.post<IUserResponse>(`${this.url}${this.sufix}`, user, {
            headers: this._getHeader()
        });
    }

    updateUserProfileById(args: { id: number, user: IUserProfile }) {
        const { id, user } = args;
        return this._http.patch<IUserResponse>(`${this.url}${this.sufix}/profile/${id}`, user, {
            headers: this._getHeader()
        });
    }

    deleteUserById(id: number): Observable<void> {
        return this._http.delete<void>(`${this.url}${this.sufix}/${id}`, {
            headers: this._getHeader()
        });
    }

}