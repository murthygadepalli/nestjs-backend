import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';

import { User } from '../users/user.schema';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async googleLogin(data) {

    let user = await this.userModel.findOne({ email: data.email });

    if (!user) {

      user = await this.userModel.create({
        name: data.name,
        email: data.email,
        photo: data.photo,
        firebaseToken: data.firebaseToken
      });

    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!
    );

    return { user, token };
  }

}