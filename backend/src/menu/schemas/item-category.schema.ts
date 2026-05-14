import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'item_categories' })
export class ItemCategory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const ItemCategorySchema = SchemaFactory.createForClass(ItemCategory);
