/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:04:00
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-07-15 13:19:36
 * @flow
 */
import liob from './liob';
import { isFunction, isPrimitive, isObservableObject, invariant } from './utils';
import event from './event';
/**
 * 设计流程:
 * observable 函数传入一个待观察的对象, 对改对象进行Proxy的封装
 * 主要在get, set, delete该对象的时候出来
 * get: 当处于observer执行的时候对
 *
 */


function onGet(target, key, receiver) {
    if (key === '$raw') return target;
    let value = Reflect.get(target, key, receiver);
    if (!liob.currentObserver) {
        return liob.dataToProxy.get(value) || value;
    } else if (isFunction(value)) {
        return value;
    } else if (typeof value === 'object') {
        if (isObservableObject(value)) {
            value = toObservable(value); //eslint-disable-line
        }
    }
    const observers = liob.getObservers(target, key);
    observers.add(liob.currentObserver);
    liob.currentObserver.bindObservers.add(observers);

    return value;
}

function onSet(target, key, value, receiver) {
    const oldValue = Reflect.get(target, key, receiver);
    if (oldValue === value && key !== 'length') return true;
    Reflect.set(target, key, value, receiver);
    event.emit('set', {
        target, key, oldValue, value,
    });
    const observers = liob.getObservers(target, key);
    liob.pushQueue(observers);
    return true;
}

function onDelete(target, key) {
    const result = Reflect.deleteProperty(target, key);
    const observers = liob.getObservers(target, key);
    liob.pushQueue(observers);
    return result;
}

export function toObservable(store: {}): {} {
    if (isPrimitive(store) || liob.isProxy(store)) return store;
    let proxy = liob.dataToProxy.get(store);
    if (proxy) return proxy;

    proxy = new Proxy(store, {
        get: onGet,
        set: onSet,
        deleteProperty: onDelete,
    });

    liob.dataToProxy.set(store, proxy);
    liob.proxys.add(proxy);
    return proxy;
}

const $raw = Symbol('$raw');


export default function decorativeObservable(target: Function | {}, key: string, descriptor: any) {
    if (key && descriptor) {
        const { value, initializer } = descriptor;
        if (value) {
            invariant(typeof value === 'object', 'observable must a object');
            descriptor.value = function wrapAction(...args) {
                return toObservable.call(this, value, ...args);
            };
        } else if (initializer) {
            descriptor.value = function wrapAction(...args) {
                const value = initializer();
                invariant(typeof value === 'object', 'observable must a object');
                return toObservable.call(this, value, ...args);
            };
            delete descriptor.initializer;
        }
        return descriptor;
    } else if (typeof target === 'function') {
        target[$raw] = target;

        if (target.__proto__[$raw]) { // eslint-disable-line
            target.__proto__ = target.__proto__[$raw]; // eslint-disable-line
        }

        const proxy: Proxy<Function> = new Proxy(target, {
            construct(Cls, argumentsList) {
                const ob = new Cls(...argumentsList);
                const proxy = toObservable(ob);
                Reflect.defineProperty(ob, '$proxy', {
                    value: proxy,
                    writable: false,
                    enumerable: false,
                });
                return proxy;
            },
        });
        return proxy;
    }

    return toObservable(target);
}
