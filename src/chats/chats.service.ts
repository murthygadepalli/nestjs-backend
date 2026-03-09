import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ChatsService {

  constructor(
    @InjectModel('Message') private messageModel: Model<any>
  ) {}

  async saveMessage(data) {

    const message = new this.messageModel(data);

    return message.save();

  }


 async getUserChats(userId: string) {

  const chats = await this.messageModel.aggregate([

    {
      $match: {
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    },

    {
      $sort: { timestamp: -1 }
    },

    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', userId] },
            '$receiverId',
            '$senderId'
          ]
        },

        lastMessage: { $first: '$message' },

        time: { $first: '$timestamp' },

        unread: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiverId', userId] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },

    // JOIN USERS COLLECTION
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },

    {
      $unwind: '$user'
    },

    {
      $project: {
        contactId: '$_id',
        lastMessage: 1,
        time: 1,
        unread: 1,
        name: '$user.name',
        photo: '$user.photo'
      }
    },

    {
      $sort: { time: -1 }
    }

  ]);

  return chats;
}

  async getMessages(user1, user2) {

    return this.messageModel.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    });

  }

}