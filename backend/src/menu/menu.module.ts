import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { ItemCategory, ItemCategorySchema } from './schemas/item-category.schema';
import { Item, ItemSchema } from './schemas/item.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ItemCategory.name, schema: ItemCategorySchema },
      { name: Item.name, schema: ItemSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ])
  ],
  controllers: [MenuController],
  providers: [MenuService]
})
export class MenuModule {}
