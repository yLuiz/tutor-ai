import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConversationService } from '../../services/conversation.service';
import { IMessage } from '../../shared/models/chat.model';
import { IChatMessageBot } from '../chat/chat.component';

@Component({
  selector: 'app-shared-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-chat.component.html',
  styleUrls: ['./shared-chat.component.css'],
})
export class SharedChatComponent implements OnInit {
  messages: IMessage[] = [];
  title = 'Conversa compartilhada';
  isLoading = true;
  notFound = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  defaultMessage: IMessage = {
    role: 'bot',
    content: 'Olá! Sou seu tutor de português. Envie uma frase ou texto que você gostaria de corrigir ou melhorar, e eu te ajudarei!',
    timestamp: new Date(),
    id: 'default-message',
  };

  constructor(
    private _route: ActivatedRoute,
    private _conversationService: ConversationService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      const sharedId = params['id'];
      if (sharedId) {
        this.loadSharedConversation(sharedId);
      }
    });
  }

  private loadSharedConversation(sharedId: string) {
    this._conversationService.getSharedConversation(sharedId).subscribe({
      next: (conversation) => {

        this.messages = [
          this.defaultMessage,
          ...conversation.messages
        ] as IMessage[];
        this.title = conversation.title || 'Conversa compartilhada';
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  scrollToBottom() {
    const el = this.scrollContainer?.nativeElement as HTMLElement;
    if (el) el.scrollTop = el.scrollHeight + 100;
  }
}
