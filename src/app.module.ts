import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      onConnectionCreate: () => {
        console.log("✅ MongoDB Connected Successfully");
      },
    }),
    AuthModule,
    UsersModule,
    ChatsModule,
    GroupsModule,
  ],
})
export class AppModule {}