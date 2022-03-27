import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async editUser(userId: number, editUserDto :EditUserDto) :Promise<User> {
    const user = await this.prisma.user.update({
      where: {id: userId},
      data: {...editUserDto},
    });
    
    delete user.hash;
    return user;
  }
}
