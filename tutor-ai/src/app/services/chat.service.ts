import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import type { IChatResponse } from "../shared/models/chat.model"
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: "root",
})
export class ChatService {

    constructor(
        private http: HttpClient,
        private _authService: AuthService
    ) { }

    url = 'http://localhost:3000/api';
    sufix = '/correct';

    sendMessage(text: string): Observable<IChatResponse> {

        return this.http.post<IChatResponse>(`${this.url}${this.sufix}`, { text }, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },
        });
    }
}
