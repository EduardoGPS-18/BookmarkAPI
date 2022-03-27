import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;
}

export class LoginDto extends AuthDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}