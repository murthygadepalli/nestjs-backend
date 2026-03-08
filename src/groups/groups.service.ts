import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from './group.schema';

@Injectable()
export class GroupsService {

  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>
  ) {}

  async createGroup(data: any) {
    const group = new this.groupModel(data);
    return group.save();
  }

  async getGroups(userId: string) {
    return this.groupModel.find({
      members: userId
    });
  }

}