import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  user: Schema.Types.ObjectId;
  title?: string;
  messages: IMessage[];
  sharedId?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema<IConversation>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  messages: [MessageSchema],
  sharedId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

export const ConversationModel = model<IConversation>('Conversation', ConversationSchema);
