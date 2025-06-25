import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { Observable } from "rxjs";
import { environment } from "../../env/env.local";
import type { IChatResponse } from "../shared/models/chat.model";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: "root",
})
export class ChatService {

    constructor(
        private http: HttpClient,
        private _authService: AuthService
    ) { }

    url = environment.apiUrl;
    sufix = '/ai';

    sendMessage(text: string): Observable<IChatResponse> {

        return this.http.post<IChatResponse>(`${this.url}${this.sufix}/correct`, { text }, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },
        });
    }

    sendMessageV2(args: {
        text: string,
        conversationId?: string;
    }): Observable<{ correctedText: string, conversationId: string }> {
        return this.http.post<{ correctedText: string, conversationId: string }>(`${this.url}${this.sufix}/v2/correct`, args, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },
        });
    }
}
