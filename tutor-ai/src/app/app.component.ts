import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"
import { Component, type ElementRef, ViewChild, ViewEncapsulation, effect, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import type { IMessage } from "./shared/models/chat.model"
import { ChatService } from "./services/chat.service"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    RouterModule
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: "./app.component.html",
  styles: [
    `
    :host {
      display: block;
      height: 100dvh;
    }
  `,
  ],
})
export class AppComponent {}
