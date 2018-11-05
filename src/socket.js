/**
 * @overview  基于WebSocket的事务封装
 */

export default class Socket {
  // 通信地址
  source = ''

  // WS实例挂载的WebSocket实例
  socket = null

  // 事件队列
  events = {}

  lifehook = {
    beforeOpen() {

    },

    // 建立连接
    onopen() {

    },

    // 发生错误
    onerror() {

    },

    // 接收信息
    onmessage() {

    },

    // 断开链接
    oncloses() {

    }
  }

  // 参数同init方法
  constructor(config) {
    this.init(config);
  }

  // 监听消息事件
  static onMessage (instance, { data: payload }) {
    const data = JSON.parse(payload);

    instance.lifehook.onmessage(data);

    const type = data.event;

    instance.events[type]
      && instance.events[type].length
      && instance.events[type].forEach(handler => handler(data));
  };

  init({
    source = this.source,
    lifehook = this.lifehook,
  } = {}) {
    this.source = source;

    this.lifehook = {
      ...this.lifehook,
      ...lifehook,
    };

    this.lifehook.beforeOpen();
  }

  connect(config) {
    this.init(config);

    this.socket = new WebSocket(this.source);

    this.socket.onopen = this.lifehook.onopen;

    this.socket.onclose = this.lifehook.onclose;

    this.socket.onerror = this.lifehook.onerror;

    this.socket.onmessage = res => Socket.onMessage(this, res);
  }

  /**
   * @overview 注册事件
   *
   * @param   {String}    eventType   -   事件类型
   * @param   {Function}  handler     -   事件响应处理
   * @param   {Boolean}   only        -   是否唯一响应
   *
   * @return  void
   */
  on(eventType, handler, exclusive = false) {
    this.events[eventType] = this.events[eventType] || [];

    this.events[eventType] = exclusive
      ? [handler]
      : [...this.events[eventType], handler];
  }

  /**
   * @overview 注销事件
   *
   * @param   {string}    eventType   -   事件类型
   * @param   {Function}  handler     -   事件响应处理
   *
   * @return  void
   */
  off(eventType, handler = null) {
    this.events[eventType] = handler !== null
      ? this.events[eventType].filter(item => item !== handler)
      : [];
  }

  /**
   * @overview 提交事件
   *
   * @param   {string}    eventType   -   事件类型
   * @param   {Object}    payload     -   数据负载
   *
   * @return  void
   */
  emit(eventType, payload = {}) {
    const data = { event: eventType, ...payload };
    const message = JSON.stringify(data);

    this.socket.send(message);
  }

  /**
   * @overview 关闭连接&请求
   *
   * @param   {nunber}    [code]      -   状态号，ws默认1000
   * @param   {string}    [reason]    -   关闭原因
   *
   * @return  void
   */
  close(...args) {
    this.socket.close(...args);
  }
}
