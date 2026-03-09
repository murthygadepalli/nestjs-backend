import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from './group.schema';
import { GroupMessage } from './group-message.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(GroupMessage.name)
    private groupMessageModel: Model<GroupMessage>,
  ) {}

  async createGroup(data: any) {
    const group = new this.groupModel(data);
    return group.save();
  }

  async getGroups(userId: string) {
    const groups = await this.groupModel.find({ members: userId }).lean();

    // Enrich each group with last message and unread count
    const enriched = await Promise.all(
      groups.map(async (group: any) => {
        const lastMsg = await this.groupMessageModel
          .findOne({ groupId: group._id.toString() })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name')
          .lean();

        const unread = await this.groupMessageModel.countDocuments({
          groupId: group._id.toString(),
          readBy: { $nin: [userId] },
        });

        return {
          ...group,
          lastMessage: lastMsg?.message || '',
          lastMessageTime: lastMsg?.['createdAt'] || null,
          unread,
        };
      }),
    );

    return enriched;
  }

  async getGroupById(groupId: string) {
    return this.groupModel.findById(groupId).lean();
  }

  async saveGroupMessage(data: any) {
    const msg = new this.groupMessageModel(data);
    return msg.save();
  }

  async getGroupMessages(groupId: string) {
    return this.groupMessageModel
      .find({ groupId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name photo');
  }

  async getGroupMessageById(id: string) {
    return this.groupMessageModel.findById(id).populate('senderId', 'name photo');
  }
}