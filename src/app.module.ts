import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocModule } from './doc/doc.module';
import { VectorstoreModule } from './vectorstore/vectorstore.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocModule,
    VectorstoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
