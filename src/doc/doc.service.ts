import { Injectable, Logger } from '@nestjs/common';
import { Langchain } from './utils/langchain';

@Injectable()
export class DocService {
  private readonly logger = new Logger(DocService.name);
  constructor(private readonly langchain: Langchain) {}

  async loadUrl(url: string) {
    this.logger.debug('Loading URL: ' + url);
    return await this.langchain.loadUrl(url);
  }

  async query(query: string) {
    const { chain, retriever } = await this.langchain.get_chain();
    const res = await chain.invoke({
      context: await retriever.invoke(query),
      question: query,
    });

    return { response: res };
  }
}
