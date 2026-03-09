import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google-login')
  @UseInterceptors(FileInterceptor('photo'))
  login(@UploadedFile() file: Express.Multer.File, @Body() body: GoogleLoginDto) {
    if (file) {
      body.photo = `https://nestjs-backend-jn55.onrender.com/uploads/${file.filename}`;
    }
    return this.authService.googleLogin(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}