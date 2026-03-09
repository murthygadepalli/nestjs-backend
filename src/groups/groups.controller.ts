import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {

  constructor(private groupsService: GroupsService) {}

  @Post()
  createGroup(@Request() req, @Body() body: any) {
    const members = [...(body.members || []), req.user._id.toString()];
    // Deduplicate
    const uniqueMembers = [...new Set(members)];
    return this.groupsService.createGroup({
      ...body,
      createdBy: req.user._id.toString(),
      members: uniqueMembers,
    });
  }

  @Get('user-groups')
  getUserGroups(@Request() req) {
    return this.groupsService.getGroups(req.user._id.toString());
  }

  @Get(':groupId')
  getGroupById(@Param('groupId') groupId: string) {
    return this.groupsService.getGroupById(groupId);
  }

  @Get(':groupId/messages')
  getGroupMessages(@Param('groupId') groupId: string) {
    return this.groupsService.getGroupMessages(groupId);
  }
}