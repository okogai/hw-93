import * as mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Inject, Injectable } from '@nestjs/common';
import {Artist, ArtistSchema} from "../src/schemas/artist.schema";
import {Album, AlbumSchema} from "../src/schemas/album.schema";
import {Track, TrackSchema} from "../src/schemas/track.schema";
import {User, UserSchema} from "../src/schemas/user.schema";

@Injectable()
export class Fixtures {
    constructor(
        @Inject(getModelToken(User.name)) private readonly userModel: mongoose.Model<User>,
        @Inject(getModelToken(Artist.name)) private readonly artistModel: mongoose.Model<Artist>,
        @Inject(getModelToken(Album.name)) private readonly albumModel: mongoose.Model<Album>,
        @Inject(getModelToken(Track.name)) private readonly trackModel: mongoose.Model<Track>,
    ) {}

    async run() {
        try {
            await mongoose.connect('mongodb://localhost/discography');
            const db = mongoose.connection;

            try {
                await db.dropCollection('users');
                await db.dropCollection('albums');
                await db.dropCollection('artists');
                await db.dropCollection('tracks');
            } catch (e) {
                console.log('Collections were not present, skipping drop');
            }

            await this.userModel.create([
                {
                    email: 'user',
                    password: '123',
                    token: crypto.randomUUID(),
                    role: 'user',
                },
                {
                    email: 'admin',
                    password: '123',
                    token: crypto.randomUUID(),
                    role: 'admin',
                },
            ]);

            const [megMyers, korn, elliphant] = await this.artistModel.create([
                { name: 'Meg Myers', photo: 'uploads/artists/meg_myers.jpg' },
                { name: 'Korn', photo: 'uploads/artists/korn.jpg' },
                { name: 'Elliphant', photo: 'uploads/artists/elliphant.jpg' },
            ]);
            console.log('Artists created:');

            const [album1, album2, album3, album4, album5] = await this.albumModel.create([
                { title: 'Sorry', artist: megMyers._id, year: 2015, cover: 'uploads/albums/sorry.jpg' },
                { title: 'Issues', artist: korn._id, year: 1999, cover: 'uploads/albums/issues.jpg' },
                { title: 'Untouchables', artist: korn._id, year: 2002, cover: 'uploads/albums/untouchables.jpg' },
                { title: 'Take Me to the Disco', artist: megMyers._id, year: 2018, cover: 'uploads/albums/take_me_to_the_disco.jpg' },
                { title: 'Living Life Golden', artist: elliphant._id, year: 2016, cover: 'uploads/albums/living_life_golden.jpg' },
            ]);
            console.log('Albums created:');

            await this.trackModel.create([
                { title: 'Sorry', album: album1._id, trackNumber: 1, duration: '3:45', youtubeLink: 'https://www.youtube.com/watch?v=Ym1J5IAk2P4' },
                { title: 'Dead', album: album2._id, trackNumber: 1, duration: '5:01', youtubeLink: 'https://www.youtube.com/watch?v=MQ4CXxhAF8k' },
                { title: 'Here to Stay', album: album3._id, trackNumber: 1, duration: '4:22', youtubeLink: 'https://www.youtube.com/watch?v=pr3x7tS__dE' },
                { title: 'Take Me to the Disco', album: album4._id, trackNumber: 1, duration: '3:53', youtubeLink: 'https://www.youtube.com/watch?v=BMFWkdX_yn0' },
                { title: 'Step Down', album: album5._id, trackNumber: 1, duration: '3:21', youtubeLink: 'https://www.youtube.com/watch?v=gDjJUqjmzxU' },
            ]);
            console.log('Tracks created.');

            await mongoose.connection.close();
            console.log('Fixtures added successfully.');
        } catch (error) {
            console.error('Error occurred:', error);
        }
    }
}

(async () => {
    await new Fixtures(
        mongoose.model<User>(User.name, UserSchema),
        mongoose.model<Artist>(Artist.name, ArtistSchema),
        mongoose.model<Album>(Album.name, AlbumSchema),
        mongoose.model<Track>(Track.name, TrackSchema),
    ).run();
})();
