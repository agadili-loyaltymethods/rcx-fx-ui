import { Partner } from './partner';

export class Connection {
  _id: string = '';
  name: string = '';
  description: string = '';
  password: string = '';
  keyFile: string = '';
  keyPassphrase: string = '';
  partner: Partner | any = null;
  url: string = '';
  encryptionEnabled: boolean = false;
  encryptionAlgorithm: string = '';
  encryptionKey: string = '';
  encryptPassPhrase: string = '';
  compressionEnabled: boolean = false;
  compressionAlgorithm: string = '';
  org: string = '';
  compressionLevel: number = 0;
  authenticationType: string = 'Password';
  connectionType: string = '';
  userName: string = '';
  accessKeyId: string = '';
  secretAccessKey: string = '';
  region: string = '';
  tested: boolean = false;
  lastTestedAt: Date | null = null;
}