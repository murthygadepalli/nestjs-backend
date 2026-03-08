import {
 WebSocketGateway,
 SubscribeMessage,
 MessageBody,
 WebSocketServer
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({cors:true})
export class ChatsGateway {

  @WebSocketServer()
  server: Server;

  @SubscribeMessage("sendMessage")
  handleMessage(@MessageBody() data) {

    this.server.emit("newMessage", data);

    return data;

  }

}