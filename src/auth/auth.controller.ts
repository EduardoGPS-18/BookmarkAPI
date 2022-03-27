import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { AuthDto } from "./dto";
import { LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() authDto: AuthDto): any {
    return this.authService.signup(authDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() authDto: LoginDto): any {
    return this.authService.signin(authDto);
  }  
}