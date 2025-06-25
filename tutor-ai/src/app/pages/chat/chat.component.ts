import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ChatService } from "../../services/chat.service";
import { ConversationService } from "../../services/conversation.service";

export interface IChatMessageBot {
  sender: 'user' | 'bot';
  originalText: string;
  naturalText?: string; // Texto corrigido ou melhorado
  loading?: boolean;
  explaination?: string;
  correction?: string;
  timestamp?: Date; // Adiciona um timestamp opcional
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
    private _conversationService: ConversationService
  ) { }

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private _currentConversationId?: string;

  ngOnInit() {
    this._getChatMessages();
  }

  scrollToBottom() {

    setTimeout(() => {
      const el = this.scrollContainer.nativeElement as HTMLElement;
      el.scrollTop = el.scrollHeight + 100; // Adiciona um pequeno espaçamento para garantir que o scroll esteja no final
    }, 100);
  }

  messages: IChatMessageBot[] = [
    { sender: 'bot', originalText: 'Olá! Sou seu tutor de português. Envie uma frase ou texto que você gostaria de corrigir ou melhorar, e eu te ajudarei!' }
  ];

  inputMessage = '';

  isLoadingRequest = false;

  sendMessage() {

    if (this.isLoadingRequest) return; // Evita enviar múltiplas mensagens enquanto está carregando
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

  private _sendMessageToServer(args: {
    loadingMsg: { sender: 'bot'; originalText: string; loading: boolean },
    trimmed: string
  }) {

    this.scrollToBottom();

    const { loadingMsg, trimmed } = args;

    this._chatService.sendMessage(trimmed).subscribe({
      next: (response) => {

        const index = this.messages.indexOf(loadingMsg);
        if (index !== -1) this.messages.splice(index, 1);


        this.messages.push({
          sender: 'bot',
          originalText: trimmed,
          explaination: response.explicacao,
          correction: response.correcao
        });

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

  handleLoading() {
    this.isLoadingRequest = !this.isLoadingRequest;
  }

  private _getChatMessages() {
    this._conversationService.getLastConversations().subscribe({
      next: (conversations) => {
        if (conversations.length > 0) {
          const lastConversation = conversations.at(-1);

          this._currentConversationId = lastConversation!.id;

          console.log("Última conversa carregada:", lastConversation);


          const lastMessages = lastConversation!.messages.map(msg => ({
            sender: msg.role,
            originalText: msg.content,
            naturalText: msg.content,
            timestamp: msg.timestamp
          }));

          this.messages = [
            ...this.messages,
            ...lastMessages,
          ];
        }

        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erro ao carregar mensagens:', error);
      }
    });
  }

}
