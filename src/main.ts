import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors();
app.use('/uploads', express.static('uploads'));
  await app.listen(port);
  console.log(`Server running on port ${port}`);


}


bootstrap();