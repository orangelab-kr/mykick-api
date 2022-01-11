import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { ClusterInfo } from './interfaces/clusterInfo.interface';

@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getClusterInfo(): ClusterInfo {
    return this.appService.getClusterInfo();
  }
}
