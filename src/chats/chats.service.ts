import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatsService {
  constructor(@InjectModel('Message') private messageModel: Model<any>) { }

  async saveMessage(data: any) {
    const message = new this.messageModel(data);
    return message.save();
  }

  async getUserChats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const chats = await this.messageModel.aggregate([
      {
        $addFields: {
          senderObjId: { $toObjectId: '$senderId' },
          receiverObjId: { $toObjectId: '$receiverId' },
        },
      },
      {
        $match: {
          $or: [{ senderObjId: userObjectId }, { receiverObjId: userObjectId }],
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$message' },
          time: { $first: '$timestamp' },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          contactObjId: { $toObjectId: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'contactObjId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          contactId: '$_id',
          lastMessage: 1,
          time: 1,
          unread: 1,
          name: '$user.name',
          photo: '$user.photo',
          email: '$user.email',
        },
      },
      { $sort: { time: -1 } },
    ]);

    // If no chat history, return empty (no fallback to all users)
    return chats;
  }

  async getMessages(user1: string, user2: string) {
    return this.messageModel
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
          {
            senderId: new Types.ObjectId(user1) as any,
            receiverId: new Types.ObjectId(user2) as any,
          },
          {
            senderId: new Types.ObjectId(user2) as any,
            receiverId: new Types.ObjectId(user1) as any,
          },
        ],
      })
      .sort({ timestamp: 1 });
  }

  async markMessagesRead(senderId: string, receiverId: string) {
    return this.messageModel.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } },
    );
  }

  async deleteChat(user1: string, user2: string) {
    return this.messageModel.deleteMany({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    return this.messageModel.deleteOne({
      _id: messageId,
      $or: [{ senderId: userId }, { receiverId: userId }],
    });
  }
}