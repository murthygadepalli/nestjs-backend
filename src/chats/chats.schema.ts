import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  participants: Types.ObjectId[];

  @Prop()
  lastMessage: string;

  @Prop()
  lastMessageTime: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);