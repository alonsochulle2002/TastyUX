import { Controller, Get, Post, Put, Delete, Param, UseInterceptors, UploadedFile, BadRequestException, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { MenuService } from './menu.service';
import { Types } from 'mongoose';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('template/download')
  async downloadTemplate(@Res() res: Response) {
    return this.menuService.generateTemplate(res);
  }

  @Get(':restaurantId')
  async getMenu(@Param('restaurantId') restaurantId: string) {
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('ID de restaurante inválido');
    }
    return this.menuService.getMenuForPublic(restaurantId);
  }

  @Post(':restaurantId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMenuExcel(
    @Param('restaurantId') restaurantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('ID de restaurante inválido');
    }
    return this.menuService.processExcelUpload(restaurantId, file.buffer);
  }

  @Post(':restaurantId/item')
  async addItem(
    @Param('restaurantId') restaurantId: string,
    @Body() itemData: any,
  ) {
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('ID de restaurante inválido');
    }
    return this.menuService.addItem(restaurantId, itemData);
  }

  @Put(':restaurantId/item/:itemId')
  async updateItem(
    @Param('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() itemData: any,
  ) {
    if (!Types.ObjectId.isValid(restaurantId) || !Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('IDs inválidos');
    }
    return this.menuService.updateItem(restaurantId, itemId, itemData);
  }

  @Get(':restaurantId/categories')
  async getCategories(@Param('restaurantId') restaurantId: string) {
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('ID de restaurante inválido');
    }
    return this.menuService.getCategories(restaurantId);
  }

  @Post(':restaurantId/category')
  async createCategory(
    @Param('restaurantId') restaurantId: string,
    @Body() data: any,
  ) {
    if (!Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('ID de restaurante inválido');
    }
    return this.menuService.createCategory(restaurantId, data);
  }

  @Put(':restaurantId/category/:categoryId')
  async updateCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
    @Body() data: any,
  ) {
    if (!Types.ObjectId.isValid(restaurantId) || !Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('IDs inválidos');
    }
    return this.menuService.updateCategory(restaurantId, categoryId, data);
  }

  @Delete(':restaurantId/category/:categoryId')
  async deleteCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    if (!Types.ObjectId.isValid(restaurantId) || !Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('IDs inválidos');
    }
    return this.menuService.deleteCategory(restaurantId, categoryId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado imagen');
    }
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    return {
      imageUrl: `${baseUrl}/uploads/${file.filename}`
    };
  }
}
