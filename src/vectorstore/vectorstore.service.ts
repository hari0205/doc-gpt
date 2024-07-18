import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  DistanceStrategy,
  PGVectorStore,
} from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VectorstoreService implements OnModuleInit, OnModuleDestroy {
  async onModuleDestroy() {
    this.logger.log('Destroying All');
    await this.pgvectorStore.end();
  }

  constructor(private readonly config: ConfigService) {}

  private pgvectorStore: PGVectorStore;
  private readonly logger = new Logger(VectorstoreService.name);
  async onModuleInit() {
    const config = {
      postgresConnectionOptions: {
        type: 'postgres',
        host: this.config.get<string>('DB_HOST'),
        port: this.config.get<number>('DB_PORT'),
        user: this.config.get<string>('DB_USER'),
        password: this.config.get<string>('DB_PASS'),
        database: this.config.get<string>('DB_DATABASE'),
      } as PoolConfig,
      tableName: 'testlangchain',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'vector',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
      distanceStrategy: 'cosine' as DistanceStrategy,
    };

    try {
      this.pgvectorStore = await PGVectorStore.initialize(
        new OpenAIEmbeddings({
          apiKey: this.config.get<string>('OPENAI_APIKEY'),
        }),
        config,
      );
    } catch (error) {
      this.logger.error('Error initializing pgvector store', error);
    }

    this.logger.log('Vector DB loaded successfully.');
  }

  getVectorStore(): PGVectorStore {
    return this.pgvectorStore;
  }
}
