import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, Observable } from "rxjs";
import { UserRoles } from "../shared/enums/UserRoles";
import { UserHelper } from "../shared/helpers/user.helper";
import { environment } from "../../env/env.local";

interface DecodedToken {
    exp: number; // tempo de expiração (em segundos desde Epoch)
    iat?: number;
    [key: string]: any;
}

export interface ILoginResponse {
    token: string;
    user: {
        id: number, name: string, email: string, role: UserRoles, isActive: boolean
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private _http: HttpClient,
        private _router: Router
    ) { }

    url = environment.apiUrl;
    sufix = '/login';

    getDecodedToken(): DecodedToken | null {
        const token = this.getValidToken();
        if (!token) return null;
        try {
            const cleanedToken = token.replace(/^Bearer\s+/i, '');
            return jwtDecode<DecodedToken>(cleanedToken);
        } catch (error) {
            console.error('Erro ao decodificar o token:', error);
            return null;
        }
    }

    getValidToken(): string | null {
        const token = localStorage.getItem('token');


        if (!token) return null;

        try {
            const cleanedToken = token.replace(/^Bearer\s+/i, '');
            const decoded: DecodedToken = jwtDecode(cleanedToken);

            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp > currentTime) {
                return cleanedToken;
            } else {
                console.warn('Token expirado');
                return null;
            }
        } catch (error) {
            console.error('Token inválido ou mal formatado:', error);
            return null;
        }
    }

    login(email: string, password: string) {
        return new Observable<ILoginResponse>(observer => {
            this._http.post<ILoginResponse>(`${this.url}${this.sufix}`, { email, password }).subscribe({
                next: (response) => {
                    if (response && response.token) {
                        localStorage.setItem('token', response.token);

                        UserHelper.setUserInfo({
                            id: response.user.id,
                            name: response.user.name,
                            email: response.user.email,
                            role: response.user.role,
                            isActive: response.user.isActive,
                            lastAccess: new Date().toISOString(),
                            correctedTexts: 0
                        })

                        observer.next(response);
                    }
                    else {
                        observer.error('Login failed');
                    }
                },
                error: (error) => {
                    observer.error(error);
                }
            });

        });
    }

    logout(args?: {
        hasTokenExpired?: boolean
    }) {
        const hasTokenExpired = args?.hasTokenExpired || false;

        localStorage.removeItem('token');
        UserHelper.clearUserInfo();
        this._router.navigate(['/login'], {
            queryParams: { reason: hasTokenExpired ? 'expired' : undefined }
        });
    }
}