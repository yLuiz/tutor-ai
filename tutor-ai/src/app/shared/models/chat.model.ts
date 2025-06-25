export interface IMessage {
  id: string
  role: "user" | "bot"
  content: string
  timestamp: Date
}

export interface IChatResponse {
  // corrected: string,
  explicacao: string,
  correcao: string
  id: string
}
