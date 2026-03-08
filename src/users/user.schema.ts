import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  photo: string;

  @Prop()
  firebaseToken: string;

  @Prop({default: Date.now})
  createdAt: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);