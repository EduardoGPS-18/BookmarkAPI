import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
  ) {}
  
  async signup({email, password}: AuthDto): Promise<any> {
    const hash: string = await argon2.hash(password);

    try {
      const user: User = await this.prismaService.user.create({ data: { email, hash } })
      const token: String = await this.signToken(user.id, user.email);
      return { token };
    } catch(err) {
      if(err instanceof PrismaClientKnownRequestError) {
        if(err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw err;
    }
  }

  async signin({email, password}: AuthDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({ where: {email} });
    if(!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon2.verify(user.hash, password);
    if(!pwMatches) throw new ForbiddenException('Credentials incorrect');
    
    const token: String = await this.signToken(user.id, user.email);
    return { token };
  }

  signToken(userId: number, email: string): Promise<String> {
    const data = {
      sub: userId,
      email: email,
    };
    const tokenSignOptions: JwtSignOptions = {
      expiresIn: '24h',
      secret: this.configService.get('JWT_SECRET'),
    };

    return this.jwtService.signAsync(data, tokenSignOptions);
  }
}