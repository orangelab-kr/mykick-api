import { ClusterInfo } from './clusterInfo.interface';

export type PackageInfo = Pick<
  ClusterInfo,
  'name' | 'version' | 'description' | 'author'
>;
