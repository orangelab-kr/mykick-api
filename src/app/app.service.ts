import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile } from 'fs/promises';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import { ClusterInfo } from './interfaces/clusterInfo.interface';
import { PackageInfo } from './interfaces/packageInfo.interface';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private clusterInfo: ClusterInfo;
  public DisplayMode = {
    dev: 'Development Mode',
    stg: 'Staging Mode',
    prd: 'Production Mode',
  };

  async onModuleInit() {
    const clusterInfo = await this.getClusterInfo();
    this.logger.log('- Package Information -');
    this.logger.log(`Package name: ${clusterInfo.name}`);
    this.logger.log(`Package version: ${clusterInfo.version}`);
    this.logger.log(`Package description: ${clusterInfo.description}`);
    this.logger.log(`Package author: ${clusterInfo.author}`);

    this.logger.log('- Cluster Information -');
    this.logger.log(`Cluster name: ${clusterInfo.hostname}`);
    this.logger.log(`Cluster mode: ${this.DisplayMode[clusterInfo.mode]}`);
  }

  async getClusterInfo(): Promise<ClusterInfo> {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageFile = await readFile(packagePath);
    const packageJson: PackageInfo = JSON.parse(packageFile.toString());
    const mode = process.env.NODE_ENV || 'prd';
    const hostname = os.hostname();
    return { ...packageJson, hostname, mode };
  }

  getClusterInfoFromCache(): ClusterInfo {
    return this.clusterInfo;
  }
}
