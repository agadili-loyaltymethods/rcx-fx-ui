export class CustomUrlSerializer {
  private static encodeUrl(url: string): string {
    return url.replace(/\+/gi, '%2B');
  }

  static parse(url: string): URL {
    const encodedUrl = this.encodeUrl(url);
    return new URL(encodedUrl);
  }

  static serialize(url: URL): string {
    return url.toString().replace(/\+/gi, '%2B');
  }
}