import {
    BadRequestException,
    Body,
    Controller, Delete,
    Get,
    NotFoundException,
    Param, Patch,
    Post
} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Track, TrackDocument} from "../schemas/track.schema";
import {CreateTrackDTO} from "./create-track.dto";

@Controller('tracks')
export class TracksController {
    constructor(
        @InjectModel(Track.name)
        private trackModel: Model<TrackDocument>,
    ) {}

    @Get()
    async getAll(){
        return this.trackModel.find();
    }
    @Get(":id")
    async getOne(@Param("id") id: string) {
        const track = await this.trackModel.findById(id);

        if (!track) throw new NotFoundException("Track not Found");

        return track;
    }
    @Post()
    async create(@Body() trackData: CreateTrackDTO) {
        if (!trackData.title) throw new BadRequestException('Title is required');
        if (!trackData.album) throw new BadRequestException('Album is required');
        if (!trackData.duration) throw new BadRequestException('Duration is required');
        if (!trackData.trackNumber) throw new BadRequestException('Track number is required');

        const track = new this.trackModel({
            title: trackData.title,
            album: trackData.album,
            duration: trackData.duration,
            trackNumber: trackData.trackNumber,
            youtubeLink: trackData.youtubeLink
        });
        return await track.save();
    }
    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateData: CreateTrackDTO) {

        const track = await this.trackModel.findById(id);

        if (!track) throw new NotFoundException("Track not found");

        if(updateData.title) track.title = updateData.title;

        if(updateData.duration) track.duration = updateData.duration;

        if(updateData.trackNumber) track.trackNumber = updateData.trackNumber;

        if(updateData.youtubeLink) track.youtubeLink = updateData.youtubeLink;

        await track.save();
        return track;
    }
    @Delete(":id")
    async delete(@Param("id") id: string) {
        const track = await this.trackModel.findByIdAndDelete(id);

        if (!track) throw new NotFoundException("Track not found");

        return {message: 'Track deleted successfully.'};
    }
}
