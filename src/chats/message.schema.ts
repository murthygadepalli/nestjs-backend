import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Message {

  @Prop()
  senderId: string;

  @Prop()
  receiverId: string;

  @Prop()
  message: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: false })
  isRead: boolean;

}

export const MessageSchema = SchemaFactory.createForClass(Message);