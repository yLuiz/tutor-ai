import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"
import { Component, ElementRef, ViewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ChatService } from "../../services/chat.service";

export interface IChatMessageBot {
  sender: 'user' | 'bot';
  originalText: string;
  loading?: boolean;
  explaination?: string;
  correction?: string;
}

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./chat.component.html",
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  scrollToBottom() {

    setTimeout(() => {
      const el = this.scrollContainer.nativeElement as HTMLElement;
      el.scrollTop = el.scrollHeight + 100; // Adiciona um pequeno espaçamento para garantir que o scroll esteja no final
    }, 100);



  }

  // scrollToBottomIfNearBottom() {
  //   const el = this.scrollContainer.nativeElement;

  //   const threshold = 100; // px de tolerância para considerar "quase no final"
  //   const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

  //   if (isNearBottom) {
  //     el.scrollY = el.scrollHeight;
  //   }
  // }


  messages: IChatMessageBot[] = [
    { sender: 'bot', originalText: 'Olá! Sou seu tutor de português. Envie uma frase ou texto que você gostaria de corrigir ou melhorar, e eu te ajudarei!' }
  ];
  inputMessage = '';

  isLoadingRequest = false;

  constructor(
    private _chatService: ChatService
  ) { }

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
      this.messages.push({ sender: 'bot', originalText: 'Sua mensagem é muito longa. Por favor, envie uma frase ou texto mais curto.' });
      this.inputMessage = '';
      this.handleLoading();
      return;
    }

    const loadingMsg: { sender: 'bot'; originalText: string; loading: boolean } = { sender: 'bot', originalText: 'Analisando a frase...', loading: true };
    this.messages.push(loadingMsg);


    // this._sendMessageToServer({ loadingMsg, trimmed });
    this._simulateBotResponse({ loadingMsg, trimmed });

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

  private _simulateBotResponse(args: {
    loadingMsg: { sender: 'bot'; originalText: string; loading: boolean },
    trimmed: string
  }) {
    this.scrollToBottom();

    const { loadingMsg, trimmed } = args;
    setTimeout(() => {
      // Remove a mensagem de loading
      const index = this.messages.indexOf(loadingMsg);
      if (index !== -1) this.messages.splice(index, 1);

      // Adiciona resposta real
      this.messages.push({
        sender: 'bot',
        originalText: trimmed,
        explaination: 'Esta é uma explicação fictícia sobre a correção.',
        correction: 'Esta é a correção fictícia do texto.'
      });

      this.handleLoading();
      this.scrollToBottom();
    }, 1500);
  }

  handleLoading() {
    this.isLoadingRequest = !this.isLoadingRequest;
  }
}
