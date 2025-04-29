import { Partner } from './partner';
export class Connection {
  _id: string;
  name: string;
  description: string;
  password: string;
  keyFile: String;
  keyPassphrase: String;
  partner: Partner | any;
  url: string;
  encryptionEnabled: boolean;
  encryptionAlgorithm: string;
  encryptionKey: string;
  encryptPassPhrase: string;
  compressionEnabled: boolean;
  compressionAlgorithm: string;
  org: string;
  compressionLevel: number;
  authenticationType: string;
  connectionType: string;
  userName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  tested: boolean;
  lastTestedAt: Date;
  constructor() {
    this.encryptionEnabled = false;
    this.compressionEnabled = false;
    this.authenticationType = 'Password';
  }
}
