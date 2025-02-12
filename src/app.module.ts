import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtistsController } from './artists/artists.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Artist, ArtistSchema} from "./schemas/artist.schema";
import {Album, AlbumSchema} from "./schemas/album.schema";
import {Track, TrackSchema} from "./schemas/track.schema";

@Module({
  imports: [
      MongooseModule.forRoot('mongodb://localhost/discography'),
      MongooseModule.forFeature([
        { name: Artist.name, schema: ArtistSchema },
        { name: Album.name, schema: AlbumSchema },
        { name: Track.name, schema: TrackSchema }
      ]),
  ],
  controllers: [AppController, ArtistsController],
  providers: [AppService],
})
export class AppModule {}
