import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Restaurant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  tradeName: string;

  @Prop({ required: true, unique: true })
  ruc: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  telephone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  logoUrl: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);