import { DatabaseModule } from '@/database/database.module'
import { PrismaService } from '@/database/prisma/prisma.service'
import { Module } from '@nestjs/common'
import { PostsPrismaRepository } from './repositories/posts-prisma.repository'

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'PostsRepository',
      useFactory: (prisma: PrismaService) => {
        return new PostsPrismaRepository(prisma)
      },
      inject: ['PrismaService'],
    },
  ],
})
export class PostsModule {}
