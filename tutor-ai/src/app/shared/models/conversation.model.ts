export interface IMessage {
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

export interface IConversation {
    id: string;
    user: string;
    title?: string;
    messages: IMessage[];
    sharedId?: string;
    createdAt: Date;
}