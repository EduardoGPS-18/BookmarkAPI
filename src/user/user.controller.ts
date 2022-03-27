import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { EditUserDto } from './dto/edit-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('edit')
  @UseGuards(JwtGuard)
  editUser(@GetUser() user: User, @Body() editUserDto: EditUserDto) {
    return this.userService.editUser(user.id, editUserDto);
  }
}
