import { v4 as uuidv4 } from 'uuid';
import { ConversationRepository } from '../../db/repositories/ConversationRepository';

export class ConversationService {
  private conversationRepository = new ConversationRepository();

  async createConversation(data: {
    userId: string;
    messages: any[];
    title?: string;
  }) {
    const conversation = await this.conversationRepository.create(data);
    return { ...conversation, id: conversation._id };
  }

  async getConversationsByUser(userId: string, page: number, limit: number) {
    return await this.conversationRepository.findByUserId({
      userId,
      take: limit,
      skip: page * limit
    });
  }

  async getConversationById(id: string) {
    return await this.conversationRepository.findById(id);
  }

  async appendMessages(conversationId: string, messages: any[]) {
    return await this.conversationRepository.appendMessages(conversationId, messages);
  }

  async shareConversation(id: string) {
    const sharedId = uuidv4();
    const result = await this.conversationRepository.shareConversation(id, sharedId);
    if (!result) return null;
    return sharedId;
  }

  async getSharedConversation(sharedId: string) {
    return await this.conversationRepository.findBySharedId(sharedId);
  }

  async updateConversation(id: string, data: Partial<{ title: string; messages: any[] }>) {
    return await this.conversationRepository.update(id, data);
  }

  async deleteConversation(id: string) {
    return await this.conversationRepository.delete(id);
  }
}
