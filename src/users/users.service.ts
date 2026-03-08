import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async findAll() {
    return this.userModel.find();
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

}