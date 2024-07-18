import { Module } from '@nestjs/common';
import { DocController } from './doc.controller';
import { DocService } from './doc.service';
import { VectorstoreModule } from 'src/vectorstore/vectorstore.module';
import { Langchain } from './utils/langchain';


@Module({
  controllers: [DocController],
  providers: [DocService, Langchain],
  imports: [VectorstoreModule],
})
export class DocModule {}
