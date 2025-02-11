import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Artist {
    @Prop( { required: true })
    name: string;
    @Prop()
    photo: string;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);