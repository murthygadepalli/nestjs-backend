import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {

  constructor(private groupsService: GroupsService) {}

  @Post()
  createGroup(@Body() body: any) {
    return this.groupsService.createGroup(body);
  }

  @Get(':userId')
  getUserGroups(@Param('userId') userId: string) {
    return this.groupsService.getGroups(userId);
  }

}