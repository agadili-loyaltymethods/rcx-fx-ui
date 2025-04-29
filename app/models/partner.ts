export class Partner {
  _id: string;
  name: string;
  code: string;
  status: string;
  email: string;
  phone: string;
  contactFirst: string;
  contactLast: string;
  program: string;
  org: string;
  divisions: [string];
  partnerType: string;
  timezone: string;
  isHostingPartner: boolean;
  constructor() {
    this.isHostingPartner = false;
  }
}
