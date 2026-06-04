import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItemCategory } from './schemas/item-category.schema';
import { Item } from './schemas/item.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import * as ExcelJS from 'exceljs';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(ItemCategory.name) private categoryModel: Model<ItemCategory>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  async getMenuForPublic(restaurantId: string) {
    const objectId = new Types.ObjectId(restaurantId);
    const restaurant = await this.restaurantModel.findById(objectId).exec();
    const categories = await this.categoryModel.find({ restaurant_id: objectId }).sort({ displayOrder: 1 }).exec();
    const items = await this.itemModel.find({ restaurant_id: objectId, active: true }).exec();

    // Agrupar items por categoría
    const menu = categories.map(category => ({
      ...category.toObject(),
      items: items.filter(item => item.category_id.equals(category._id))
    }));

    return { restaurant, menu };
  }

  async processExcelUpload(restaurantId: string, fileBuffer: Buffer) {
    const objectId = new Types.ObjectId(restaurantId);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('El archivo Excel está vacío o es inválido');
    }

    const importedItems: Item[] = [];
    let currentRow = 2; // Asumimos fila 1 es cabecera

    while (worksheet.getRow(currentRow).hasValues) {
      const row = worksheet.getRow(currentRow);
      const name = row.getCell(1).value?.toString();
      const description = row.getCell(2).value?.toString() || '';
      const price = parseFloat(row.getCell(3).value?.toString() || '0');
      const categoryName = row.getCell(4).value?.toString();
      const imageUrl = row.getCell(5).value?.toString() || '';

      if (name && categoryName) {
        // Encontrar o crear la categoría
        let category = await this.categoryModel.findOne({ restaurant_id: objectId, name: categoryName });
        if (!category) {
          category = await this.categoryModel.create({
            restaurant_id: objectId,
            name: categoryName,
            displayOrder: 0
          });
        }

        // Crear o actualizar el item
        const item = await this.itemModel.findOneAndUpdate(
          { restaurant_id: objectId, name },
          {
            category_id: category._id,
            description,
            price,
            image_url: imageUrl,
            active: true
          },
          { new: true, upsert: true }
        );
        importedItems.push(item as any);
      }
      currentRow++;
    }

    return { message: `${importedItems.length} ítems importados exitosamente`, count: importedItems.length };
  }

  async addItem(restaurantId: string, itemData: any) {
    const objectId = new Types.ObjectId(restaurantId);
    
    let category = await this.categoryModel.findOne({ restaurant_id: objectId, name: itemData.category });
    if (!category) {
      category = await this.categoryModel.create({
        restaurant_id: objectId,
        name: itemData.category,
        displayOrder: 0
      });
    }

    const newItem = await this.itemModel.create({
      restaurant_id: objectId,
      category_id: category._id,
      name: itemData.name,
      description: itemData.description,
      price: parseFloat(itemData.price),
      active: true
    });

    return newItem;
  }
}
