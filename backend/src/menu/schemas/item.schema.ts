import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'items' })
export class Item extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ItemCategory', required: true })
  category_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image_url: string;

  @Prop({ default: true })
  active: boolean;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
