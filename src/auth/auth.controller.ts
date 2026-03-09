import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('google-login')
  login(@Body() body: GoogleLoginDto) {
    return this.authService.googleLogin(body);
  }

}