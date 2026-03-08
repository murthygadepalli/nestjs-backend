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

  async getMessages(user1, user2) {

    return this.messageModel.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    });

  }

}

