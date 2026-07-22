import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';

import { Public } from '../../common/auth/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@UseInterceptors(NoFilesInterceptor())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() request: RegisterDto) {
    return this.authService.register(request);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  login(@Body() request: LoginDto) {
    return this.authService.login(request);
  }
}
