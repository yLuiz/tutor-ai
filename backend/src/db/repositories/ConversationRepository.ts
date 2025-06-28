import { ConversationModel, IConversation } from '../entities/ConversationEntity';

export class ConversationRepository {
  async findById(id: string): Promise<(IConversation & { id: string }) | null> {
    const conversation = await ConversationModel.findById(id).lean();
    if (!conversation) return null;

    return {
      ...conversation,
      id: conversation._id.toString(),
    } as IConversation & { id: string };
  }

  async findByUserId(args: {
    userId: string,
    take: number,
    skip: number
  }): Promise<(IConversation & { id: string })[]> {

    const { userId, take, skip } = args;

    const conversations = await ConversationModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .lean();


    return conversations.map((conv) => ({
      ...conv,
      id: conv._id.toString(),
    })) as (IConversation & { id: string })[];
  }

  async update(id: string, data: Partial<IConversation>): Promise<IConversation | null> {
    const updatedConversation = await ConversationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();

    return updatedConversation;
  }

  async create(data: {
    userId: string;
    messages: IConversation['messages'];
    title?: string;
  }): Promise<IConversation> {
    const conversation = new ConversationModel({
      user: data.userId,
      messages: data.messages,
      title: data.title,
    });
    return await conversation.save();
  }

  async appendMessages(id: string, newMessages: { role: 'user' | 'bot', content: string, timestamp?: Date }[]): Promise<IConversation | null> {
    const timestampedMessages = newMessages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp ?? new Date()
    }));


    const updatedConversation = await ConversationModel.findByIdAndUpdate(
      id,
      { $push: { messages: { $each: timestampedMessages } } },
      { new: true }
    ).lean();

    return updatedConversation;
  }

  async shareConversation(id: string, sharedId: string): Promise<IConversation | null> {
    return await ConversationModel.findByIdAndUpdate(
      id,
      { sharedId },
      { new: true }
    ).lean();
  }

  async findBySharedId(sharedId: string): Promise<(IConversation & { id: string }) | null> {
    const conversation = await ConversationModel.findOne({ sharedId }).lean();
    if (!conversation) return null;

    return {
      ...conversation,
      id: conversation._id.toString(),
    } as IConversation & { id: string };
  }

  async delete(id: string): Promise<boolean> {
    const result = await ConversationModel.findByIdAndDelete(id);
    return !!result;
  }
}
