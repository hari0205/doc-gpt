import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { compile } from 'html-to-text';
import { RecursiveUrlLoader } from '@langchain/community/document_loaders/web/recursive_url';
import { VectorstoreService } from 'src/vectorstore/vectorstore.service';
import { Document } from 'langchain/document';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { VectorStoreRetrieverInput } from '@langchain/core/vectorstores';
import { HtmlToTextTransformer } from '@langchain/community/document_transformers/html_to_text';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { pull } from 'langchain/hub';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Langchain {
  private compiledConvert = compile({ wordwrap: 130 });
  private readonly logger = new Logger(Langchain.name);
  constructor(
    private readonly vectorService: VectorstoreService,
    private config: ConfigService,
  ) {}

  public async loadUrl(url: string) {
    try {
      const loader = new RecursiveUrlLoader(url, {
        extractor: this.compiledConvert,
        maxDepth: 5,
      });

      const docs = await loader.load();
      this.logger.debug('Parsed ' + docs.length + ' docs');

      const splitter = RecursiveCharacterTextSplitter.fromLanguage('html', {
        chunkSize: 400,
        chunkOverlap: 50,
      });
      const transformer = new HtmlToTextTransformer();

      const sequence = splitter.pipe(transformer);

      const new_docs = await sequence.invoke(docs);

      return await this.addDocs(new_docs);
    } catch (error) {
      this.logger.error('Some error occurred while loading...', error);
    }
  }

  private async addDocs(docs: Document<Record<string, any>>[]) {
    const vectorstore = this.vectorService.getVectorStore();

    try {
      await vectorstore.addDocuments(docs);
      this.logger.log('Docs added to vector store');
      return {message: 'Added documents to vector store', status: HttpStatus.OK}
    } catch (error) {
      this.logger.error('Failed to add docs to vector store', error);
    }
  }

  private async getRetriever(
    options?: Partial<VectorStoreRetrieverInput<PGVectorStore>>,
  ) {
    return this.vectorService.getVectorStore().asRetriever(options);
  }

  public async get_chain() {
    const retriever = await this.getRetriever({});
    const prompt = await pull<ChatPromptTemplate>('rlm/rag-prompt');
    const llm = new ChatOpenAI({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      apiKey: this.config.get<string>('OPENAI_APIKEY'),
      verbose: true,
    });
    const ragChain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser(),
    });

    return { chain: ragChain, retriever };
  }
}
