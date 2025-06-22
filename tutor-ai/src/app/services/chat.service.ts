import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import type { IChatResponse } from "../shared/models/chat.model"
import { AuthService } from "./auth.service";
import { environment } from "../../env/env.local";

@Injectable({
    providedIn: "root",
})
export class ChatService {

    constructor(
        private http: HttpClient,
        private _authService: AuthService
    ) { }

    url = environment.apiUrl;
    sufix = '/correct';

    sendMessage(text: string): Observable<IChatResponse> {

        return this.http.post<IChatResponse>(`${this.url}${this.sufix}`, { text }, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },
        });
    }
}
