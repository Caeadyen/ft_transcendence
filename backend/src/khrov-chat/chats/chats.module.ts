import { Module } from '@nestjs/common'
import { ChatsController } from './chats.controller'
import { ChatsService } from './chats.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ChatsController],
  providers: [ChatsService]
})
export class ChatsModule {}
