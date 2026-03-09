import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupMessageDocument = GroupMessage & Document;

@Schema({ timestamps: true })
export class GroupMessage {

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop([String])
  readBy: string[];

}

export const GroupMessageSchema = SchemaFactory.createForClass(GroupMessage);
