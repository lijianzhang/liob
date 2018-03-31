/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 20:31:49
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-03-31 21:05:36
 * @flow
 */
import liob from './liob';

export default class Observer {
    constructor(callBack: Function, name?: string) {
        /**
         * 每次依赖被修改的时候都会触发callBack
         */
        this.callBack = callBack;
        this.name = name;
    }

    callBack: ?Function;

    name: ?string;

    bindObservers: Set<Set<Observer>> = new Set();

    observers: Set<Observer>;

    /** 执行fn并对fn进行依赖收集 */
    collectDep(fn: Function) {
        this.beginCollectDep();
        const res = fn();
        this.endCollectDep();
        return res;
    }

    beginCollectDep() {
        this.clearBinds();
        liob.currentObserver = this;
    }

    endCollectDep() {
        const index = liob.collectObservers.indexOf(this);
        liob.collectObservers.splice(index, 1);
    }

    clearBinds() {
        this.bindObservers.forEach((observers) => {
            observers.delete(this);
        });
        this.bindObservers.clear();
    }

    run() {
        if (this.callBack) this.callBack(this);
    }

    unSubscribe() {
        this.clearBinds();
        this.callBack = null;
    }
}

export function observe(fn: Function, name: string = 'observe') {
    if (!fn) throw new Error('you need set callBack');
    const ob = new Observer((observer) => {
        observer.collectDep(fn);
    }, name);
    ob.run();
    return ob;
}
