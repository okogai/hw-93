import {Body, Controller, Delete, Post, Req, UseGuards} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../schemas/user.schema";
import {Model} from "mongoose";
import {RegisterUserDto} from "./register-users.dto";
import {AuthGuard} from "@nestjs/passport";
import {Request} from "express";
import {TokenAuthGuard} from "../token-auth/token-auth.guard";

@Controller('users')
export class UsersController {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>) {}
    @Post('register')
    registerUser(@Body() registerUserDto: RegisterUserDto){
        const user = new this.userModel({
           email: registerUserDto.email,
           password: registerUserDto.password,
           displayName: registerUserDto.displayName,
        });
        user.generateToken();
        return user.save();
    }

    @UseGuards(AuthGuard('local'))
    @Post('sessions')
    async login(@Req() req: Request<{user: User}>) {
        return req.user;
    }

    @UseGuards(TokenAuthGuard)
    @Delete('sessions')
    async logout(@Req() req: Request){
        const user = req.user as UserDocument;
        user.generateToken();
        await user.save();
        return {message: 'Logged Out'};
    }
}
