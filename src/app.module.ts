import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistsController } from './artists/artists.controller';

@Module({
  imports: [],
  controllers: [AppController, ArtistsController],
  providers: [AppService],
})
export class AppModule {}
