import liob from './liob';
import { isFunction, isPrimitive } from './utils';
import event from './event';
/**
 * 设计流程:
 * observable 函数传入一个待观察的对象, 对改对象进行Proxy的封装
 * 主要在get, set, delete该对象的时候出来
 * get: 当处于observer执行的时候对
 *
 */

function isDisabledType(target) {
    if (target.construct === Set) return false;
    if (target.construct === WeakSet) return false;
    if (target.construct === Map) return false;
    if (target.construct === WeakMap) return false;
    if (target.construct === HTMLDivElement) return false;
    return true;
}

function onGet(target, key, receiver) {
    if (key === '$raw') return target;
    let value = Reflect.get(target, key, receiver);
    if (isDisabledType(target)) return value;
    if (!liob.currentObserver) {
        return liob.dataToProxy.get(value) || value;
    } else if (isFunction(value)) {
        return value;
    } else if (!isPrimitive(value)) {
        value = toObservable(value); //eslint-disable-line
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

function onDelete(target, key, receiver) {
    const result = Reflect.deleteProperty(target, key, receiver);
    const observers = liob.getObservers(target, key);
    liob.pushQueue(observers);
    return result;
}

export function toObservable(store) {
    if (isPrimitive(store) || liob.isProxy(store)) return store;
    if (liob.isObservable(store)) return liob.dataToProxy.get(store);
    const proxy = new Proxy(store, {
        get: onGet,
        set: onSet,
        deleteProperty: onDelete,
    });

    liob.dataToProxy.set(store, proxy);
    liob.proxys.add(proxy);
    return proxy;
}

export default function decorativeObservable(target) {
    if (isFunction(target)) {
        return new Proxy(target, {
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
    }
    return toObservable(target);
}
