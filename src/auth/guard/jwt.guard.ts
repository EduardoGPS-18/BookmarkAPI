import { AuthGuard } from '@nestjs/passport';

export class JwtGuard extends AuthGuard('customJWT') {
  constructor() {
    super();
  }
}