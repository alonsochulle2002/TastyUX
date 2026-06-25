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
      image_url: itemData.image_url,
      active: true
    });

    return newItem;
  }

  async updateItem(restaurantId: string, itemId: string, itemData: any) {
    const resId = new Types.ObjectId(restaurantId);
    
    let updatePayload: any = {
      name: itemData.name,
      description: itemData.description,
      price: parseFloat(itemData.price),
    };

    if (itemData.image_url !== undefined) {
      updatePayload.image_url = itemData.image_url;
    }

    if (itemData.category) {
      let category = await this.categoryModel.findOne({ restaurant_id: resId, name: itemData.category });
      if (!category) {
        category = await this.categoryModel.create({
          restaurant_id: resId,
          name: itemData.category,
          displayOrder: 0
        });
      }
      updatePayload.category_id = category._id;
    }

    const updatedItem = await this.itemModel.findOneAndUpdate(
      { _id: new Types.ObjectId(itemId), restaurant_id: resId },
      updatePayload,
      { new: true }
    );

    if (!updatedItem) {
      throw new BadRequestException('Ítem no encontrado');
    }

    return updatedItem;
  }

  async getCategories(restaurantId: string) {
    return this.categoryModel.find({ restaurant_id: new Types.ObjectId(restaurantId) }).sort({ displayOrder: 1 }).exec();
  }

  async createCategory(restaurantId: string, data: any) {
    return this.categoryModel.create({
      restaurant_id: new Types.ObjectId(restaurantId),
      name: data.name,
      displayOrder: data.displayOrder || 0
    });
  }

  async updateCategory(restaurantId: string, categoryId: string, data: any) {
    const updated = await this.categoryModel.findOneAndUpdate(
      { _id: new Types.ObjectId(categoryId), restaurant_id: new Types.ObjectId(restaurantId) },
      { name: data.name, displayOrder: data.displayOrder },
      { new: true }
    );
    if (!updated) throw new BadRequestException('Categoría no encontrada');
    return updated;
  }

  async deleteCategory(restaurantId: string, categoryId: string) {
    const catId = new Types.ObjectId(categoryId);
    const resId = new Types.ObjectId(restaurantId);

    // Check if there are items in this category
    const itemsCount = await this.itemModel.countDocuments({ category_id: catId, restaurant_id: resId });
    if (itemsCount > 0) {
      throw new BadRequestException('No se puede eliminar la categoría porque tiene ítems asociados.');
    }

    const deleted = await this.categoryModel.findOneAndDelete({ _id: catId, restaurant_id: resId });
    if (!deleted) throw new BadRequestException('Categoría no encontrada');
    
    return { success: true };
  }

  async generateTemplate(res: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla');
    
    worksheet.columns = [
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Descripción', key: 'desc', width: 40 },
      { header: 'Precio', key: 'price', width: 15 },
      { header: 'Categoría', key: 'cat', width: 25 },
      { header: 'URL Imagen', key: 'img', width: 40 },
    ];
    
    worksheet.addRow({
      name: 'Ej: Hamburguesa Clásica',
      desc: 'Pan artesanal, 200g carne, queso',
      price: 15.50,
      cat: 'Platos Fuertes',
      img: 'https://ejemplo.com/imagen.jpg'
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_menu.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}
