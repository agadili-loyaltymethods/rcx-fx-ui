import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

export class CustomUrlSerializer implements UrlSerializer {
  private _defaultUrlSerializer: DefaultUrlSerializer =
    new DefaultUrlSerializer();

  parse(url: string): UrlTree {
    url = url.replace(/\+/gi, '%2B');

    return this._defaultUrlSerializer.parse(url);
  }

  serialize(tree: UrlTree): string {
    return this._defaultUrlSerializer.serialize(tree).replace(/\+/gi, '%2B');
  }
}
