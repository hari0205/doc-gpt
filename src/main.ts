import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllHttpExceptionsFilter } from './all-exception-filter/all-exceptions-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger :['log', 'error','debug']
  });
  app.useGlobalFilters(new AllHttpExceptionsFilter());
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
