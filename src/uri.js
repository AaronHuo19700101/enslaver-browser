/**
 * @overview  处理URI相关的事务逻辑
 */

export default class Uri {
  origin = ''

  static fields = [
    'protocol',
    'hostname',
    'port',
    'pathname',
    'search',
    'hash',
  ]

  static pattern = /^(?:(?<protocal>[A-Za-z]+:)\/+)?(?<hostname>[0-9\.A-Za-z]+)?(?::(?<port>\d+))?(?<pathname>\/?[^?#]*)?(?<search>\?[^#]*)?(?<hash>#.*)?$/

  // location => route
  static deMap = {
    protocol:
      value => value.slice(0, -1),
    hostname:
      value => value,
    port:
      value => value,
    pathname:
      value => value,
    search:
      value => value.slice(1).split('&')
        .reduce((acc, entry) => {
          const [key, value = ''] = entry.split('=');

          return key ? { ...acc, [key]: value } : acc;
        }, {}),
    hash:
      value => value.slice(1),
  }

  // route => origin
  static enMap = {
    protocol:
      value => value ? `${value}://` : '',
    hostname:
      value => value,
    port:
      value => value ? `:${value}`: '',
    pathname:
      value => value,
    search:
      (value = {}) => {
        const keys = Object.keys(value).filter(key => value[key]);

        if(!keys.length) return '';

        const string = keys.map(key => [key, value[key]]).join('&');

        return `?${string}`;
      },
    hash:
      value => value ? `#${value}` : '',
  }

  constructor(value) {
    this.origin = typeof value === 'string'
      ? value : Uri.encode(value);
  }

  get location() {
    const { group = {} } = Uri.match(this.origin);

    const target = Uri.reduce((acc, key) => {
      const value = group[key] || '';

      return { ...acc, [key]: value };
    });

    return target;
  }

  get route() {
    const deMap = Uri.deMap;

    const target = Uri.reduce((acc, key) => {
      const decode = deMap[key];
      const value = this.location[key];

      return { ...acc, [key]: decode(value) };
    });

    return target;
  }

  static match(string = '') {
    return string.match(this.pattern) || {};
  }

  static reduce(reducer, init = {}) {
    return this.fields.reduce(reducer, init);
  }

  static decode(string, pattern, callback) {
    const value = string.match(pattern) || [];

    const result = value[1] || '';

    return callback ? callback(result) : result;
  }

  static encode(route = {}) {
    const enMap = Uri.enMap;

    return this.reduce((acc, key) => {
      const encode = enMap[key];
      const value = route[key] || '';

      return `${acc}${encode(value)}`
    }, '');
  }
}
