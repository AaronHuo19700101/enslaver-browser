/**
 * @overview 基于fetch的Ajax请求封装
 */

import Uri from './uri';

class Http {
  // 请求基础域名
  baseURI = ''

  // 请求公共头部
  baseHeaders = {}

  // fetch公共请求配置
  baseInit = {}

  // 请求成功AOP处理
  successAOP = res => res;

  // 请求错误AOP处理
  errorAOP = (res) => {
    throw res;
  }

  constructor(config) {
    this.init(config);
  }

  /**
   * @overview  初始化配置，实例化后也可以用来reset
   *
   * @return  void
   */
  init({
    baseURI = this.baseURI,
    baseHeaders = this.baseHeaders,
    baseInit = this.baseInit,
    errorAOP = this.errorAOP,
    successAOP = this.successAOP,
  } = {}) {
    this.baseURI = baseURI;
    this.baseHeaders = baseHeaders;
    this.baseInit = baseInit,
    this.errorAOP = errorAOP;
    this.successAOP = successAOP;
  }

  /**
   * @overview 完整的URL ? 使用 : 拼接
   *
   * @param {Object} uri - 接口地址
   *
   * @return  {string}
   */
  handleURI (uri) {
    const { route } = new Uri(uri);

    return route.protocol ? uri : `${this.baseURI}${uri}`;
  }

  /**
   * @overview 每次请求时携带的公共头部
   *
   * @param {Object} headers  - 本次指定请求头，相同内容会覆盖公共头数据
   *
   * @return  {Header}
   */
  handleHeaders(headers = {}) {
    return new Headers({ ...this.baseHeaders, ...headers });
  }

  /**
   * @overview 处理fetch所需的init信息
   *
   * @param {object}  init信息体
   *
   * @return  {object}  处理后的init信息体
   */
  handleInit = ({
    method,
    headers = {},
    body,
    ...restInit,
  }) => {
    const headerInit = this.handleHeaders(headers);

    let payload = body;

    if (
      typeof body === 'object'
        && !(body instanceof FormData)
    ) {
      payload = JSON.stringify(body);
      headerInit.append('Content-Type', 'application/json');
    }

    return body
      ? {
        method,
        headers: headerInit,
        body: payload,
        ...this.baseInit,
        ...restInit,
      }
      : {
        method,
        headers: headerInit,
        ...this.baseInit,
        ...restInit,
      };
  }

  /**
   * 处理服务器响应
   *
   * @param  response  -  请求返信息集合
   *
   * @return {object} 返回的数据解析结果
   */
  handleResponse(response) {
    const payload = response.json();

    return response.ok
      ? payload.catch(() => {
        console.warn('请求成功，返回结果不是JSON数据.');
        return {};
      })
      : payload.then((error) => { throw error });
  }

  async handleRequest({
    uri,
    method = 'GET',
    headers = {},
    body,
    ...restInit
  }) {
    const response = await fetch(
      this.handleURI(uri),
      this.handleInit({ method, headers, body, ...restInit }),
    );

    try {
      const payload = await this.handleResponse(response);
      return this.successAOP(payload);
    } catch (error) {
      return this.errorAOP(error);
    }
  }

  /**
   * @overview get请求
   *
   * @param {string} uri
   * @param {Object} [headers]
   */
  get(uri, { headers, ...restInit } = {}) {
    return this.handleRequest({ method: 'GET', uri, headers, ...restInit });
  }

  /**
   * @overview delete请求
   *
   * @param {string} uri
   * @param {Object} [headers]
   */
  delete(uri, { headers, ...restInit } = {}) {
    return this.handleRequest({ method: 'DELETE', uri, headers, ...restInit });
  }

  /**
   * @overview post请求
   *
   * @param {string} uri
   * @param {Object} body
   * @param {Object} [headers]
   */
  post(uri, body, { headers, ...restInit } = {}) {
    return this.handleRequest({ method: 'POST', uri, body, headers, ...restInit });
  }

  /**
   * patch请求
   * @param {string} uri
   * @param {Object} body
   * @param {Object} [headers]
   */
  patch(uri, body, { headers, ...restInit } = {}) {
    return this.handleRequest({ method: 'PATCH', uri, body, headers, ...restInit });
  }

  /**
   * @overview put请求
   *
   * @param {string} uri
   * @param {Object} body
   * @param {Object} [headers]
   */
  put(uri, body, { headers, ...restInit } = {}) {
    return this.handleRequest({ method: 'PUT', uri, body, headers, ...restInit });
  }
}

export default Http;
