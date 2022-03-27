import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { CreateBookmarkDto } from '../src/bookmark/dto/create-bookmark.dto';
import { EditBookmarkDto } from '../src/bookmark/dto/edit-bookmark.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto/edit-user.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({whitelist: true}));
    await app.init();
    await app.listen(3333);

    prismaService = app.get(PrismaService);
    await prismaService.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async (): Promise<void> => await app.close());

  describe('Auth', () => {
    const mockDTO: AuthDto = {email: 'email@mail.com', password: 'password123'};
  
    describe('Signup', () => {    
      it('should signup', async () => {
        return pactum.spec().post('/auth/signup').withBody(mockDTO).expectStatus(201);
      });

      it('should returns 400 if no password is provided', async () => {
        const mockDTO = { email: 'email@mail.com' }
        return pactum.spec().post('/auth/signup').withBody(mockDTO).expectStatus(400);
      });
      
      it('should returns 400 on week password', async () => {
        const mockDTO = { email: 'email@mail.com', password: 'pass123' }
        return pactum.spec().post('/auth/signup').withBody(mockDTO).expectStatus(400);
      });
      
      it('should returns 400 if no email is provided', async () => {
        const mockDTO = { password: 'pass123' }
        return pactum.spec().post('/auth/signup').withBody(mockDTO).expectStatus(400);
      });
      
      it('should returns 400 if no email is invalid', async () => {
        const mockDTO = { email: 'emailmail.com' }
        return pactum.spec().post('/auth/signup').withBody(mockDTO).expectStatus(400);
      });
    });

    describe('Signin', () => {
      it('should signin', async () => {
        return pactum.spec().post('/auth/signin').withBody(mockDTO).expectStatus(200).stores('token', 'token');
      });

      it('should returns 400 if no email is provided', async () => {
        const mockDTO = {password: 'password123'}
        return pactum.spec().post('/auth/signin').withBody(mockDTO).expectStatus(400);
      });

      it('should returns 400 if no password is provided', async () => {
        const mockDTO = {email: 'email@mail.com'}
        return pactum.spec().post('/auth/signin').withBody(mockDTO).expectStatus(400);
      });

      it('should returns 400 if no contains email registered is provided', async () => {
        const mockDTO = {email: 'invalid_mail', password: 'password123'}
        return pactum.spec().post('/auth/signin').withBody(mockDTO).expectStatus(400);
      });

      it('should returns 403 if no contains email registered is provided', async () => {
        const mockDTO = {email: 'no_existent@mail.com', password: 'password123'}
        return pactum.spec().post('/auth/signin').withBody(mockDTO).expectStatus(403);
      });

      it('should returns 403 if password not match registered is provided', async () => {
        const { email } = mockDTO;
        const password = 'incorrect_password';
        return pactum.spec().post('/auth/signin').withBody({email, password}).expectStatus(403);
      });
    });
  });
  
  const auth: {Authorization: string} = {
    Authorization: 'Bearer $S{token}',
  };
  const invalidAuth: {Authorization: string} = {
    Authorization: 'Bearer invalid_authorization'
  };

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders(auth).expectStatus(200);
      });
      
      it('should returns 400 if no token is set', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Authorization: `Bearer `
        }).expectStatus(401);
      });

      it('should returns 401 if token is invalid', () => {
        return pactum.spec().get('/users/me').withHeaders(invalidAuth).expectStatus(401);
      });
    });

    describe('Edit', () => {
      const editUserDto: EditUserDto = {
        email: 'anymail@mail.com',
        firstName: 'any_name',
      };

      it('should edit user', () => {
        return pactum.spec().patch('/users/edit')
          .withHeaders(auth).withBody(editUserDto).expectStatus(200)
          .expectBodyContains(editUserDto.firstName).expectBodyContains(editUserDto.email);
      });
      
      it('should returns 401 if no token is provided', () => {
        const auth: {Authorization: string} = {
          Authorization: 'Bearer ',
        };
        return pactum.spec().patch('/users/edit')
          .withHeaders(auth).withBody(editUserDto).expectStatus(401);
      });
      
      it('should returns 401 on invalid token', () => {
          const auth: {Authorization: string} = {
          Authorization: 'Bearer invalid_token',
        };
        return pactum.spec().patch('/users/edit')
          .withHeaders(auth).withBody(editUserDto).expectStatus(401);
      });
    });
  });

  describe('Bookmarks', () => {
    
    describe('Create', () => {
      const createBookmarkDto: CreateBookmarkDto = {
        title: 'any_bookmark',
        link: 'any_bookmark_link',
        description: 'any_description',
      };
      it('should create bookmark', () => {
        return pactum.spec().post('/bookmark').withHeaders(auth).withBody(createBookmarkDto)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
        .inspect()
        .expectBodyContains(createBookmarkDto.link)
        .expectBodyContains(createBookmarkDto.title)
        .expectBodyContains(createBookmarkDto.description);
      });
      it('should returns 401 on invalid authorization', () => {
        return pactum.spec().post('/bookmark').withHeaders(invalidAuth).withBody(createBookmarkDto)
        .expectStatus(401);
      });
      it('should returns 400 on missing title', () => {
        const createBookmarkDto = { link: 'any_bookmark_link' };
        return pactum.spec().post('/bookmark').withHeaders({
          Authorization: 'Bearer $S{token}',
        }).withBody(createBookmarkDto).expectStatus(400);
      });
      it('should returns 400 on missing link', () => {
        const createBookmarkDto = { title: 'any_title' };
        return pactum.spec().post('/bookmark').withHeaders({
          Authorization: 'Bearer $S{token}',
        }).withBody(createBookmarkDto).expectStatus(400);
      });
    });
   
    describe('Get', () => {
      it('should return all user bookmarks', () => {
        return pactum.spec().get('/bookmark/list').withHeaders(auth).expectStatus(200);
      });
      it('should returns 401 on invalid user', () => {
        return pactum.spec().get('/bookmark/list').withHeaders(invalidAuth).expectStatus(401);
      });
    });

    describe('Get bookmark by id', () => {
      it('should return book an bookmark', () => {
        return pactum.spec().get('/bookmark/{id}').withPathParams('id', '$S{bookmarkId}')
          .withHeaders(auth).expectStatus(200);
      });
      it('should returns 401 on invalid token', () => {
        return pactum.spec().get('/bookmark/{id}').withPathParams('id', '$S{bookmarkId}')
          .withHeaders(invalidAuth).expectStatus(401);
      });
    });

    describe('Edit bookmark', () => {
      const editBookmarkDto: EditBookmarkDto = {
        link: 'changed_bookmark_link',
        description: 'changed_bookmark_description',
      }
      it('should edit a bookmark', async () => {
        return pactum.spec().patch('/bookmark/{id}').withPathParams('id', '$S{bookmarkId}')
          .withHeaders(auth).withBody(editBookmarkDto).expectStatus(200)
          .expectBodyContains(editBookmarkDto.link).expectBodyContains(editBookmarkDto.description);
      });
      it('should returns 403 if bookmark id is invalid', async () => {
        return pactum.spec().patch('/bookmark/{id}').withPathParams('id', 102)
          .withHeaders(auth).withBody(editBookmarkDto).expectStatus(403);
      });
      it('should returns 401 if user id is invalid', async () => {
        return pactum.spec().patch('/bookmark/{id}').withPathParams('id', '$S{bookmarkId}')
          .withHeaders(invalidAuth).withBody(editBookmarkDto).expectStatus(401);
      });
    });

    describe('Delete bookmark', () => {
      it('should delete an bookmark', async () => {
        return pactum.spec().delete('/bookmark/{id}').withPathParams('id', '$S{bookmarkId}')
          .withHeaders(auth).expectStatus(200);
      });
      it('should returns 401 on invalid user', async () => {
        return pactum.spec().delete('/bookmark/{id}').withPathParams('id', '$S{bookmarkId}')
          .withHeaders(invalidAuth).expectStatus(401);
      });
      it('should returns 403 invalid bookmark id', async () => {
        return pactum.spec().delete('/bookmark/{id}').withPathParams('id', 123)
          .withHeaders(auth).expectStatus(403);
      });
    });
  });
});