import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupsService } from './groups.service';
import { FirebaseService } from '../notifications/firebase.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: '*' } })
export class GroupsGateway implements OnGatewayConnection {
  constructor(
    private groupsService: GroupsService,
    private firebaseService: FirebaseService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);
      if (token) {
        const payload: any = jwt.verify(
          token,
          process.env.JWT_SECRET || 'secret123',
        );
        client.data.userId = payload.id;
      }
    } catch (e) {
      // handled in chats gateway
    }
  }

  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    const room = `group_${data.groupId}`;
    client.join(room);
    client.emit('joinedGroup', { groupId: data.groupId });
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    client.leave(`group_${data.groupId}`);
  }

  @SubscribeMessage('sendGroupMessage')
  async handleGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const senderId = data.senderId || client.data.userId;

    const saved = await this.groupsService.saveGroupMessage({
      groupId: data.groupId,
      senderId,
      message: data.message,
      readBy: [senderId],
    });

    const populated = await this.groupsService.getGroupMessageById(
      saved._id.toString(),
    );

    const payload = {
      _id: saved._id,
      groupId: data.groupId,
      senderId,
      senderName: populated?.senderId?.['name'] || data.senderName || 'User',
      senderPhoto: populated?.senderId?.['photo'] || '',
      message: data.message,
      createdAt: saved['createdAt'] || new Date(),
    };

    // emit to group room
    this.server.to(`group_${data.groupId}`).emit('newGroupMessage', payload);

    return payload;
  }
}
