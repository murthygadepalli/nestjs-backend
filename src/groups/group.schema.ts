import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Group {

  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop([String])
  members: string[];

  @Prop()
  createdBy: string;

}

export const GroupSchema = SchemaFactory.createForClass(Group);