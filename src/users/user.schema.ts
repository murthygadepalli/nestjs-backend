import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

  @Prop({ unique: true })
  name: string;

 
@Prop({ unique: true })
email: string;

@Prop()
photo: string;

@Prop()
phone: string;

@Prop()
fcmToken: string;

@Prop({ default: Date.now })
createdAt: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);