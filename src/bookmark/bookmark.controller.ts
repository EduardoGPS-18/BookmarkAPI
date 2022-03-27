import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}
  
  @Get('list')
  async getBookmarks(@GetUser('id', ParseIntPipe) userId: number) {
    return await this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  async getBookmarkById(
    @GetUser('id', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number
  ) {
    return await this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  async createBookmark(
    @GetUser('id', ParseIntPipe) userId: number,
    @Body() createBookmarkDto: CreateBookmarkDto
  ) {
    return await this.bookmarkService.createBookmark(userId, createBookmarkDto);
  }

  @Patch(':id')
  async editBookmarkById(
    @GetUser('id', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() editBookmarkDto: EditBookmarkDto,
  ) {
    return await this.bookmarkService.editBookmarkById(
      userId, bookmarkId, editBookmarkDto
    );

  }

  @Delete(':id')
  async deleteBookmarkById(
    @GetUser('id', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number
  ) {
    return await this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
