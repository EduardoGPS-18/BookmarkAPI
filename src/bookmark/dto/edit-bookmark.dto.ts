import { IsOptional, IsString } from 'class-validator';

export class EditBookmarkDto  {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;
}