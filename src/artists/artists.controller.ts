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
  UploadedFile,
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

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
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
  async delete(@Param('id') id: string) {
    const artist = await this.artistModel.findByIdAndDelete(id);

    if (!artist) throw new NotFoundException('Artist not Found');

    return { message: 'Artist deleted successfully.' };
  }
}
