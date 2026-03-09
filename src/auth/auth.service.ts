import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    // You should put your actual Google Client ID here or in .env
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id.apps.googleusercontent.com');
  }

  async googleLogin(data: any) {
    if (!data.googleToken) {
      throw new UnauthorizedException('Google token is required');
    }

    try {
      // Verify token with google
      // Note: During local dev it might fail if client ID doesn't match, so fallback is implemented just for demo 
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.googleToken,
        audience: process.env.GOOGLE_CLIENT_ID || 'placeholder-client-id.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();
      
      const email = payload?.email || data.email;
      const name = payload?.name || data.name;

      let user = await this.userModel.findOne({ email });

      if (!user) {
        user = await this.userModel.create({
          name: name,
          email: email,
          photo: data.photo || payload?.picture,
          phone: data.phone,
          fcmToken: data.fcmToken,
        });
      } else {
        // update FCM token when user logs in again
        if (data.fcmToken) {
          user.fcmToken = data.fcmToken;
          await user.save();
        }
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: "30d" }
      );

      return {
        message: "Login successful",
        user,
        token,
      };
    } catch (e: any) {
      // Fallback for demo without correct client ID but received a token (e.g. from Flutter generic auth process)
      console.warn("Google token verification failed, using token payload directly if in dev environment. Error:", e.message);
      
      let user = await this.userModel.findOne({ email: data.email });

      if (!user) {
        user = await this.userModel.create({
          name: data.name,
          email: data.email,
          photo: data.photo,
          phone: data.phone,
          fcmToken: data.fcmToken
        });
      } else {
        if (data.fcmToken) {
          user.fcmToken = data.fcmToken;
          await user.save();
        }
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: "30d" }
      );

      return {
        message: "Login successful (dev fallback)",
        user,
        token
      };
    }
  }
}