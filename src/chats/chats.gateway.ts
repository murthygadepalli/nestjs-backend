import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../notifications/firebase.service';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private chatsService: ChatsService,
    private usersService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  @WebSocketServer()
  server: Server;

  // Store userId -> socketId mapping
  private userSocketMap = new Map<string, string>();

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
        this.userSocketMap.set(payload.id, client.id);
        console.log(`User ${payload.id} connected via socket`);
      }
    } catch (e) {
      console.warn('Socket auth failed:', e.message);
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSocketMap.delete(client.data.userId);
      console.log(`User ${client.data.userId} disconnected`);
    }
  }

  /** Client joins a 1:1 chat room */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    client.emit('joinedRoom', { roomId: data.roomId });
  }

  /** Client leaves a room */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
  }

  /** Send a 1:1 message */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    // save to DB
    const saved = await this.chatsService.saveMessage({
      senderId: data.senderId || client.data.userId,
      receiverId: data.receiverId,
      message: data.message,
      timestamp: new Date(),
      isRead: false,
    });

    const messagePayload = {
      _id: saved._id,
      senderId: data.senderId || client.data.userId,
      receiverId: data.receiverId,
      message: data.message,
      timestamp: saved['timestamp'] || new Date(),
      isRead: false,
    };

    // emit to the specific room
    if (data.roomId) {
      this.server.to(data.roomId).emit('newMessage', messagePayload);
    } else {
      // fallback: emit directly to receiver socket
      const receiverSocketId = this.userSocketMap.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', messagePayload);
      }
      client.emit('newMessage', messagePayload);
    }

    // send FCM push notification
    try {
      const receiverOnline = this.userSocketMap.has(data.receiverId);
      if (!receiverOnline && data.receiverId) {
        const receiver = await this.usersService.findById(data.receiverId);
        if (receiver && receiver.fcmToken) {
          await this.firebaseService.sendPush(
            receiver.fcmToken,
            `New message: ${data.message}`,
          );
        }
      }
    } catch (e) {
      console.warn('Could not send push notification:', e.message);
    }

    return messagePayload;
  }

  /** Mark messages as read */
  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string },
  ) {
    await this.chatsService.markMessagesRead(data.senderId, data.receiverId);
    // Notify sender their messages were read
    const senderSocketId = this.userSocketMap.get(data.senderId);
    if (senderSocketId) {
      this.server
        .to(senderSocketId)
        .emit('messagesRead', { receiverId: data.receiverId });
    }
  }
}