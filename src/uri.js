/**
 * @overview  处理URI相关的事务逻辑
 */

export default class Uri {
  origin = ''

  constructor(value = '')
  {
    this.origin = value;
  }

  get route()
  {
    return {
      protocol: Uri.decodeProtocol(this.origin),
      query: Uri.decodeQuery(this.origin),
      hash: Uri.decodeHash(this.origin),
    };
  }

  /**
   * @overview  解析protocol值
   */
  static decodeProtocol(uri)
  {
    const string = decodeURIComponent(uri);
    const pattern = /^(\S+):\/\//i;
    const result = string.match(pattern);

    return (result && result[1]) ? result[1] : '';
  }

  /**
   * @overview  解析search键和值的对象
   */
  static decodeQuery(uri)
  {
    const string = decodeURIComponent(uri);
    const pattern = /\?([^#]+)#?/i;
    const result = string.match(pattern);

    if (!result || !result[1]) return null;

    const fragments = result[1].split('&');

    const object = fragments
      .reduce((acc, item) => {
        const entry = item.split('=');

        if (entry[0] && entry[1]) acc[entry[0]] = entry[1];

        return acc;
      }, {});

    return Object.keys(object).length ? object : {};
  };

  /**
   * @overview  解析hash值
   */
  static decodeHash(uri) {
    const string = decodeURIComponent(uri);
    const pattern = /#(\S+)/i;
    const result = string.match(pattern);

    return (result && result[1]) ? result[1] : '';
  }

  /**
   * @overview  将Query对象生成为search
   *
   * @param   {object}  hrefObject  - 包含query字段的完整href对象
   * @param   {object}  prefix      - 生成Query URI的前缀
   *
   * @return  {string}  search字符串
   */
  static encodeQuery(query, prefix = '?')
  {
    const keys = Object.keys(query);

    if (!keys.length) return '';

    const uri = keys
      .reduce((acc, key, index) =>  {
        const hyphen = index ? '&' : prefix;

        return `${acc}${hyphen}${key}=${query[key]}`;
      }, '');

    return uri;
  }

  /**
   * @overview  生成hash格式值
   */
  static encodeHash(value) {
    return value ? `#${value}` : '';
  }

  /**
   * @overview  生成protocol格式值
   */
  static encodeProtocol(value) {
    return value ? `${value}://` : '';
  }
}
