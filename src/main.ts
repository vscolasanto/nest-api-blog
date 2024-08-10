import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // considera apenas as propriedades esperadas no input,
      errorHttpStatusCode: 422, // erro padrão, pode ser customizado
    }),
  )
  await app.listen(process.env.PORT || 3000)
}
bootstrap()
