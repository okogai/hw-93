import { Document } from 'mongoose';
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import * as bcrypt from 'bcrypt';
import {randomUUID} from "node:crypto";

export interface UserDocument extends Document {
    email: string;
    password: string;
    displayName: string;
    token: string;
    generateToken: () => void;
    checkPassword: (password: string) => Promise<boolean>;
}

const SALT_WORK_FACTOR = 10;

@Schema()
export class User {
    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true, default: 'user', enum: ['user', 'admin']})
    role: string;

    @Prop({required: true})
    token: string;

    @Prop()
    displayName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
    this.token = randomUUID();
};

UserSchema.methods.checkPassword = function (password: string) {
    return bcrypt.compare(password, this.password)
};

UserSchema.pre<UserDocument>('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    }
});



