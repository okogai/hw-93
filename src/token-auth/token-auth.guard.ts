import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User} from "../schemas/user.schema";

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async canActivate(context: ExecutionContext): Promise<boolean>{
    const request = context.switchToHttp().getRequest();

    const token = request.get('Authorization');

    if (!token) {
      return false;
    }

    const user = await this.userModel.findOne({token});

    if (!user) {
      return false;
    }

    request.user = user;

    return true;
  }
}
