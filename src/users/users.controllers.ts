import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Request() req) {
    const users = await this.usersService.findAll();
    // exclude current user from the list
    return users.filter(user => user._id.toString() !== req.user?._id.toString());
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user._id);
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() body: any) {
    return this.usersService.update(req.user._id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

}