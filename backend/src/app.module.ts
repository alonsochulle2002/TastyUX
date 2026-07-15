import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/restaurante_db'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    RestaurantsModule,
    MenuModule,
  ],
})
export class AppModule {}
