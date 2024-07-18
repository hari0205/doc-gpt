import { Body, Controller, Get, Logger } from '@nestjs/common';
import { DocService } from './doc.service';

@Controller('doc')
export class DocController {
  private logger = new Logger(DocController.name);
  constructor(private readonly docService: DocService) {}

  @Get('load')
  async getDocs(@Body() { url }: { url: string }) {
    this.logger.log(url);
    return this.docService.loadUrl(url);
  }

  @Get('predict')
  async getPrediction(@Body() { query }: { query: string }) {
    return this.docService.query(query);
  }
}
