import liob from './liob';
import { isFunction, isPrimitive, isComputed } from './utils';
import { runAction } from './action';
import computed from './computed';
/**
 * 设计流程:
 * observable 函数传入一个待观察的对象, 对改对象进行Proxy的封装
 * 主要在get, set, delete该对象的时候出来
 * get: 当处于observer执行的时候对
 *
 */

function onGetWithFuc(fn, self) {
    if (liob.funcToAction.has(fn)) {
        return liob.funcToAction.get(fn);
    }
    const newFunc = (...arg) => runAction.call(self, fn, ...arg);
    liob.funcToAction.set(fn, newFunc);
    return newFunc;
}

function onGet(target, key, receiver) {
    const descriptor = isComputed(target, key);
    if (descriptor && !liob.computeds.has(descriptor)) {
        if (!Array.isArray(target)) {
            const computedDescriptor = computed(target, key, descriptor);
            Reflect.defineProperty(target, key, computedDescriptor);
            liob.computeds.add(computedDescriptor);
            return Reflect.get(target, key, receiver);
        }
    }
    let value = Reflect.get(target, key, receiver);
    if (isFunction(value) && Reflect.get(target, 'isRootDataSource', receiver)) {
        return onGetWithFuc(value, liob.dataToProxy.get(target));
    } else if (liob.inAction) {
        return liob.dataToProxy.get(value) || value;
    } else if (!isPrimitive(value)) {
        value = toObservable(value); //eslint-disable-line
    }
    if (liob.currentObserver) {
        const observers = liob.getObservers(target, key);
        observers.add(liob.currentObserver);
        liob.currentObserver.bindObservers.add(observers);
    }

    return value;
}

function onSet(target, key, value, receiver) {
    const oldValue = Reflect.get(target, key, receiver);
    if (oldValue === value && !Array.isArray(target)) return true;
    Reflect.set(target, key, value, receiver);

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
                const ob = new Cls(argumentsList);
                ob.isRootDataSource = true;
                const proxy = toObservable(ob);
                ob.$proxy = proxy;
                return proxy;
            },
        });
    }
    return toObservable(target);
}
