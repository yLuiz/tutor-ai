import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SideMenuService } from "../../components/side-menu/side-menu.service";
import { ChatService } from "../../services/chat.service";
import { ConversationService } from "../../services/conversation.service";

export interface IChatMessageBot {
  sender: 'user' | 'bot';
  originalText: string;
  naturalText?: string;
  loading?: boolean;
  explaination?: string;
  correction?: string;
  timestamp?: Date;
}

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./chat.component.html",
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {

  constructor(
    private _chatService: ChatService,
    private _conversationService: ConversationService,
    private _sideMenuService: SideMenuService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private _currentConversationId?: string;

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      const conversationId = params['conversationId'];
      if (conversationId && conversationId !== 'new') {
        this._currentConversationId = conversationId;
        this._getChatMessages();
        return;
      }

      if (conversationId && conversationId === 'new') {
        this.startNewConversation();
        return;
      }

      else {
        this._currentConversationId = undefined;
        this._getChatMessages();
        this.messages = [
          { ...this.defaultMessage },
        ];
        return;
      }

    });
  }

  scrollToBottom() {

    setTimeout(() => {
      const el = this.scrollContainer.nativeElement as HTMLElement;
      el.scrollTop = el.scrollHeight + 100; // Adiciona um pequeno espaçamento para garantir que o scroll esteja no final
    }, 100);
  }

  defaultMessage: IChatMessageBot = {
    sender: 'bot',
    originalText: 'Olá! Sou seu tutor de português. Envie uma frase ou texto que você gostaria de corrigir ou melhorar, e eu te ajudarei!'
  };



  messages: IChatMessageBot[] = [
    { ...this.defaultMessage },
  ];

  inputMessage = '';

  isLoadingRequest = false;

  sendMessage() {

    if (this.isLoadingRequest) return;
    this.handleLoading();

    const trimmed = this.inputMessage.trim();
    if (!trimmed) {
      this.handleLoading();
      return;
    };

    this.messages.push({ sender: 'user', originalText: trimmed });
    this.inputMessage = '';

    if (trimmed.length > 255) {
      this.scrollToBottom();
      this.messages.push({ sender: 'bot', originalText: 'Sua mensagem é muito longa. Por favor, envie uma frase ou texto mais curto.' });
      this.inputMessage = '';
      this.handleLoading();
      return;
    }

    const loadingMsg: { sender: 'bot'; originalText: string; loading: boolean } = { sender: 'bot', originalText: 'Analisando a frase...', loading: true };
    this.messages.push(loadingMsg);

    // this._sendMessageToServer({ loadingMsg, trimmed });
    this._sendMessageToServerNewVersion({ loadingMsg, trimmed });

  }

  private _sendMessageToServerNewVersion(args: {
    loadingMsg: { sender: 'bot'; originalText: string; loading: boolean },
    trimmed: string
  }) {

    this.scrollToBottom();

    const { loadingMsg, trimmed } = args;


    if (!this._currentConversationId) {
      this.startNewConversation(trimmed);
      return;
    }

    this._chatService.sendMessageV2({
      text: trimmed,
      conversationId: this._currentConversationId || undefined
    }).subscribe({
      next: (response) => {

        const index = this.messages.indexOf(loadingMsg);
        if (index !== -1) this.messages.splice(index, 1);


        this.messages.push({
          sender: 'bot',
          naturalText: response.correctedText,
          originalText: trimmed,
        });

        this._currentConversationId = response.conversationId;

        this.handleLoading();
      },
      error: (error) => {
        console.error('Erro ao enviar mensagem:', error);

        const index = this.messages.indexOf(loadingMsg);
        if (index !== -1) this.messages.splice(index, 1);


        this.messages.push({
          sender: 'bot',
          originalText: 'Ocorreu um erro ao processar sua frase, o servidor pode está fora do ar. Tente novamente mais tarde.'
        });

        this.handleLoading();
      }
    })
      .add(() => {
        this.scrollToBottom();
      });

  }

  countConversation = 0;

  startNewConversation(message?: string) {
    this._conversationService.createConversation(`Conversa ${this.countConversation + 1}`)
      .subscribe({
        next: (conversation) => {
          this._currentConversationId = conversation.id;

          this.countConversation++;

          if (message && message.length > 0) {
            this._sendMessageToServerNewVersion({
              loadingMsg: { sender: 'bot', originalText: 'Iniciando nova conversa...', loading: true },
              trimmed: message || ''
            });
          }

          this._router.navigate(['/chat'], { queryParams: { conversationId: conversation.id } });

          this._sideMenuService.updateConversations.next(true);
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Erro ao criar nova conversa:', err);
        }
      });
  }

  handleLoading() {
    this.isLoadingRequest = !this.isLoadingRequest;
  }

  private _getChatMessages() {

    if (!this._currentConversationId) return;

    this._conversationService.getConversationById(this._currentConversationId!).subscribe({
      next: (conversation) => {
        this._currentConversationId = conversation.id;

        const lastMessages = conversation.messages.map(msg => ({
          sender: msg.role,
          originalText: msg.content,
          naturalText: msg.content,
          timestamp: msg.timestamp
        }));

        this.messages = [
          { ...this.defaultMessage },
          ...lastMessages,
        ];

        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erro ao carregar mensagens:', error);
      }
    })
  }
}
