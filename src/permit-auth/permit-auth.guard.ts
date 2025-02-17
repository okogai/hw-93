import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../schemas/user.schema";
import {Model} from "mongoose";
import {Reflector} from "@nestjs/core";

@Injectable()
export class PermitAuthGuard implements CanActivate {
  constructor( private reflector: Reflector, @InjectModel(User.name) private userModel: Model<User>) {}
  async canActivate( context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();

    const token = request.get('Authorization');

    if (!token) {throw new ForbiddenException('Token not provided');
    }
    const user = await this.userModel.findOne({ token });
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }

    request.user = user;
    return true;
  }
}








