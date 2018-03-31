/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 20:33:58
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-03-31 21:51:37
 * @flow
 */
import event from './event';
import useLog from './log';
import type Observer from './observer';

/**
 * 全局的数据源管理
 */

type observersType = Set<Observer>;
class Liob {
  /**
     * key: 原始值 value 原始值的proxy;
     */
  dataToProxy: WeakMap<{}, {}> = new WeakMap(); // 弱引用
  proxys: WeakSet<{}> = new WeakSet();

  useLog = useLog;

  /**
     * 当前需要触发的观察者函数会在栈至0的时候执行
     */
  queue: Set<Observer> = new Set();


  collectObservers = [];

  /**
     * action栈
     */
  stack = 0;

  readyRunQueue: boolean;

  /**
     * 当前的Observer
     */
  get currentObserver(): Observer {
      return this.collectObservers[this.collectObservers.length - 1];
  }

  set currentObserver(observer: Observer) {
      if (observer === null) {
          this.collectObservers.pop();
          return;
      }
      const index = this.collectObservers.indexOf(observer);
      if (index > -1) {
          this.collectObservers.splice(index, 1);
      }
      this.collectObservers.push(observer);
  }

  isObservable(raw: any) {
      return this.dataToProxy.has(raw);
  }

  isProxy(proxy: any) {
      return this.proxys.has(proxy);
  }

  dataKeyToObservers: WeakMap<{}, Map<string, observersType>> = new WeakMap();

  /**
     *
     * @param {object} raw 可观察对象的原始值
     * @param {string} key 可以观察对象的属性
     */
  getObservers(raw: {}, key: string) {
      let keyToObservers = this.dataKeyToObservers.get(raw);
      if (!keyToObservers) {
          keyToObservers = new Map();
          this.dataKeyToObservers.set(raw, keyToObservers);
      }

      let observers = keyToObservers.get(key);

      if (!observers) {
          // $flow-disable-line
          observers = new Set();
          keyToObservers.set(key, observers);
      }

      if (Array.isArray(Reflect.get(raw, key))) {
        const subObservers = this.getObservers(Reflect.get(raw, key), 'length'); //eslint-disable-line
          observers.forEach(observer => subObservers.add(observer));
      }

      return observers;
  }

  /**
     *
     * @param {object} raw 可观察对象的原始值
     * @param {string} key 可以观察对象的属性
     */
  hasObservers(raw: {}, key: string) {
      const map = this.dataKeyToObservers.get(raw);
      if (map && map.get(key)) {
          return true;
      }
      return false;
  }

  /**
     *
     * @param {Array<Observer>} observers 可观察对象数组
     * 修改可观察对象属性的时候触发将对应的观察者push到队列中如果不在action中特殊处理
     */
  pushQueue(observers: observersType) {
      observers.forEach((observer) => {
          this.queue.delete(observer);
          this.queue.add(observer);
      });
      if (!this.inAction && !this.readyRunQueue) {
          Promise.resolve().then(this.runQueue);
          this.readyRunQueue = true;
      }
  }

  runQueue = () => {
      this.readyRunQueue = false;
      if (this.queue.size === 0) return;
      this.queue.forEach((observer) => {
          event.emit('Observer', observer.name);
          observer.run();
      });

      this.queue.clear();
  };

  get inAction(): boolean {
      return this.stack > 0;
  }
}

const liob = new Liob();

if (window) {
    window.liob = liob;
}

if (global) {
    global.liob = liob;
}


export default liob;
