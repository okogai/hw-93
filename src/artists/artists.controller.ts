import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { diskStorage } from 'multer';
import {TokenAuthGuard} from "../token-auth/token-auth.guard";
import {PermitAuthGuard} from "../permit-auth/permit-auth.guard";
import {Roles} from "../permit-auth/permit.decorator";
import {Album, AlbumDocument} from "../schemas/album.schema";
import {Track, TrackDocument} from "../schemas/track.schema";

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  async getAll() {
    return this.artistModel.find();
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist not Found');

    return artist;
  }
  @Post()
  @UseGuards(TokenAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/artists',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname);
          cb(null, randomUUID() + extension);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only images are allowed (JPEG, PNG, GIF)'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto,
  ) {
    if (!artistData.name)
      throw new BadRequestException('Artist name is required');

    const artist = new this.artistModel({
      name: artistData.name,
      photo: file ? '/uploads/artists/' + file.filename : null,
    });

    return await artist.save();
  }
  @Patch(':id')
  @UseGuards(PermitAuthGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/artists',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname);
          cb(null, randomUUID() + extension);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only images are allowed (JPEG, PNG, GIF)'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateData: CreateArtistDto,
  ) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist not found');

    if (updateData.name) artist.name = updateData.name;

    if (file) artist.photo = `/uploads/artists/${file.filename}`;

    await artist.save();
    return artist;
  }
  @Delete(':id')
  @UseGuards(PermitAuthGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) throw new NotFoundException('Artist not Found');

    const albums = await this.albumModel.find({ artist: artist._id });
    const albumIds = albums.map(album => album._id);

    await this.trackModel.deleteMany({ album: { $in: albumIds } });

    await this.albumModel.deleteMany({ artist: artist._id });

    await artist.deleteOne();

    return { message: 'Artist deleted successfully.' };
  }
}
