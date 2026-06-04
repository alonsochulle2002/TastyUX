import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuService } from './menu.service';
import { Types } from 'mongoose';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

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
}
