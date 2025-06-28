import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SideMenuService {
    public updateConversations = new BehaviorSubject<boolean>(false);
    public chatSelected = new BehaviorSubject<string | null>(null);



}