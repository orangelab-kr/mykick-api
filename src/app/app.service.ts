import { Injectable } from '@nestjs/common';
import os from 'os';
import { author, description, name, version } from 'package.json';
import { ClusterInfo } from 'src/app/interfaces/clusterInfo.interface';

@Injectable()
export class AppService {
  hostname = os.hostname();
  mode = process.env.NODE_ENV;

  getClusterInfo(): ClusterInfo {
    const { hostname, mode } = this;
    return { name, version, mode, description, hostname, author };
  }
}
