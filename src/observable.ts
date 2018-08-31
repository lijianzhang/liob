/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:04:00
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-30 15:14:33
 * @flow
 */
import "reflect-metadata";
import store from './store';
import event from './event';
import { PROXY_KEY, OBSERVER_KEY, RAW_KEY } from './constant';
import { isFunction, isPrimitive, isObservableObject } from './utils';
import { IProxyData, IClass } from './type';
/**
 * 设计流程:
 * observable 函数传入一个待观察的对象, 对改对象进行Proxy的封装
 * 主要在get, set, delete该对象的时候出来
 * get: 当处于observer执行的时候对
 *
 */

function onGet(target: IProxyData, key: string | number | symbol, receiver) {
    let value = Reflect.get(target, key, receiver);
    if (isFunction(value) || key === RAW_KEY || key === PROXY_KEY) {
        return value;
    } else if (isObservableObject(value)) {
        if (!isPrimitive(store)) {
            value = toObservable(value);
        }
    }

    if (store.currentObserver) {
        if (!target[OBSERVER_KEY]) {
            Object.defineProperty(target, OBSERVER_KEY, {
                value: new Map(),
                writable: false,
                enumerable: false,
                configurable: false,
            });
        }

        let observers = target[OBSERVER_KEY]!.get(key);

        if (!observers) {
            observers = new Set(); 
            target[OBSERVER_KEY]!.set(key as string, observers);
        }

        observers.add(store.currentObserver);
        store.currentObserver.bindObservers.add(observers);
    }

    return value;
}

function onSet(target: IProxyData, key, value, receiver) {
    const oldValue = Reflect.get(target, key, receiver);
    if (oldValue === value && key !== 'length') return true;
    event.emit('set', { target, key, oldValue, value });
    Reflect.set(target, key, value, receiver);
    if (target[OBSERVER_KEY]) {

        const observers = target[OBSERVER_KEY]!.get(key);

        if (observers) {
            store.pushQueue(observers);
        }
    }
    return true;
}

function onDelete(target, key) {
    const result = Reflect.deleteProperty(target, key);
    if (target[OBSERVER_KEY]) {
        const observers = target[OBSERVER_KEY]!.get(key);

        if (observers) {
            store.pushQueue(observers);
        }
    }
    return result;
}

export function toObservable<T>(store: T): T {
    let proxy = store[PROXY_KEY];
    if (proxy) return proxy;

    proxy = toProxy(store);

    return proxy;
}

function toProxy<T>(store: T) {
    const proxy = new Proxy(store, {
        get: onGet,
        set: onSet,
        deleteProperty: onDelete,
    });


    Object.defineProperty(store, PROXY_KEY, {
        value: proxy,
        writable: false,
        enumerable: false,
    });



    Object.defineProperty(store, RAW_KEY, {
        value: store,
        writable: false,
        enumerable: false,
    });

    return proxy;

}

export default function observable<T>(target: T | (T & IClass) | object, key?: string): any {
    if (key) {
        const observableKey = Symbol('liob_' + key);
        (observableKey as any).type == 'attr';

        Object.defineProperty(target as object, key, {
            get: function() { 
                const value = onGet(this, observableKey, undefined);
                return value;
            },
            set: function(value) {
                onSet(this, observableKey, value, this);
            },
            enumerable: true,
        });
        return undefined;
    } else if (typeof target === 'function') {

        target[RAW_KEY] = target;  // fix extends class error
        if (target.__proto__[RAW_KEY]) {
            target.__proto__ = target.__proto__[RAW_KEY];
        }

        const proxy = new Proxy(target, {
            construct(Cls, argumentsList) {
                const ob = new Cls(...argumentsList);
                const proxy = toObservable(ob);
                return proxy;
            },
        });
        return proxy;
    }

    return toObservable(target);
}