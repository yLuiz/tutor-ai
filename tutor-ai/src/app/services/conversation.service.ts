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

    createConversation(title: string = 'Nova Conversa'): Observable<IConversation> {
        const userId = UserHelper.getUserInfo()?.id;

        if (!userId) {
            throw new Error('Usuário não autenticado');
        }

        return this.http.post<IConversation>(
            `${this.url}${this.sufix}`,
            {
                userId,
                title,
                messages: []
            },
            {
                headers: {
                    'Authorization': `Bearer ${this._authService.getValidToken()}`,
                }
            }
        );
    }

    deleteConversation(conversationId: string): Observable<void> {
        return this.http.delete<void>(`${this.url}${this.sufix}/${conversationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${this._authService.getValidToken()}`,
                }
            }
        );
    }

    getConversationById(conversationId: string): Observable<IConversation> {
        return this.http.get<IConversation>(`${this.url}${this.sufix}/${conversationId}`, {
            headers: {
                'Authorization': `Bearer ${this._authService.getValidToken()}`,
            },
        });
    }

    getConversationsPaginated(page: number = 0, limit: number = 10): Observable<IConversation[]> {
        const userId = UserHelper.getUserInfo()?.id;

        if (!userId) {
            throw new Error('Usuário não autenticado');
        }

        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        return this.http.get<IConversation[]>(
            `${this.url}${this.sufix}/user/${userId}?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${this._authService.getValidToken()}`,
                }
            }
        );
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
