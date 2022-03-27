import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly prismaService: PrismaService) {}

  async getBookmarks(userId: number) {
    return await this.prismaService.bookmark.findMany({where: {userId}});
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    return await this.prismaService.bookmark.findMany({where: {userId, id: bookmarkId}});
  }

  async createBookmark(userId: number, createBookmarkDto: CreateBookmarkDto) {
    return await this.prismaService.bookmark.create({data: {
      userId,
      ...createBookmarkDto,
    }});
  }

  private async verifyBookmarkIsOnUser(bookmarkId: number, userId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: { id: bookmarkId }
    });
    if(!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException({ message: 'Inexistent bookmark' });
    }
    return bookmark;
  } 

  async editBookmarkById(userId: number, bookmarkId: number, editBookmarkDto: EditBookmarkDto) {
    try {
      await this.verifyBookmarkIsOnUser(bookmarkId, userId);
    
      return await this.prismaService.bookmark.update({
        where: { id: bookmarkId },
        data: { ...editBookmarkDto }
      });
    } catch (err) {
      throw err;
    }
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    try {
      await this.verifyBookmarkIsOnUser(bookmarkId, userId);
      return this.prismaService.bookmark.delete({where: {id: bookmarkId}});
    } catch(err) {
      throw err;
    }
  }
}
