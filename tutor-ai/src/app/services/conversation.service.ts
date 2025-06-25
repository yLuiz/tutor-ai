import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { environment } from "../../env/env.local";
import { Observable } from "rxjs";
import { UserHelper } from "../shared/helpers/user.helper";
import { IConversation } from "../shared/models/conversation.model";

@Injectable({
    providedIn: "root",
})
export class ConversationService {
    constructor(
        private http: HttpClient,
        private _authService: AuthService
    ) { }

    url = environment.apiUrl;
    sufix = '/conversations';

    getConversationById(conversationId: string): Observable<IConversation> {
        return this.http.get<IConversation>(`${this.url}${this.sufix}/${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },
        });
    }

    getLastConversations(): Observable<IConversation[]> {
        const userId = UserHelper.getUserInfo()?.id;
        return this.http.get<IConversation[]>(`${this.url}${this.sufix}/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },

        });
    }
}
