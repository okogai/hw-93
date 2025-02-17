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
import { Album, AlbumDocument } from '../schemas/album.schema';
import { Model } from 'mongoose';
import { CreateAlbumDto } from './create-album.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import {TokenAuthGuard} from "../token-auth/token-auth.guard";
import {PermitAuthGuard} from "../permit-auth/permit-auth.guard";
import {Roles} from "../permit-auth/permit.decorator";

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}
  @Get()
  async getAll() {
    return this.albumModel.find();
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);
    if (!album) throw new NotFoundException('Albums not Found');
    return album;
  }
  @Post()
  @UseGuards(TokenAuthGuard)
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './public/uploads/albums',
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
    @Body() albumData: CreateAlbumDto,
  ) {
    if (!albumData.title) throw new BadRequestException('Title is required');
    if (!albumData.artist) throw new BadRequestException('Artist is required');
    if (!albumData.year) throw new BadRequestException('Year is required');

    const album = new this.albumModel({
      title: albumData.title,
      artist: albumData.artist,
      year: albumData.year,
      cover: file ? '/uploads/albums/' + file.filename : null,
    });

    return await album.save();
  }
  @Patch(':id')
  @UseGuards(PermitAuthGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './public/uploads/albums',
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
    @Body() updateData: CreateAlbumDto,
  ) {
    const album = await this.albumModel.findById(id);

    if (!album) throw new NotFoundException('Albums not Found');

    if (updateData.title) album.title = updateData.title;

    if (updateData.year) album.year = updateData.year;

    if (file) album.cover = `/uploads/albums/${file.filename}`;

    await album.save();
    return album;
  }
  @Delete(':id')
  @UseGuards(PermitAuthGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) throw new NotFoundException('Album not found');

    return { message: 'Album deleted successfully.' };
  }
}
