import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('google-login')
  @UseInterceptors(FileInterceptor('photo'))
  login(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: GoogleLoginDto
  ) {

    if (file) {
      body.photo = `http://localhost:3000/uploads/${file.filename}`;
    }

    return this.authService.googleLogin(body);
  }
}