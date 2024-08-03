import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'

import { AppResolver } from './app.resolver'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { AuthorsModule } from './authors/authors.module'
import path from 'node:path'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.resolve(process.cwd(), 'src/schema.gql'),
    }),
    AuthorsModule,
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
