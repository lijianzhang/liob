/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:33:17
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:04:37
 */

import Obersver from './observer';
import store from './store';
import { IProxyData, IClass } from './type';
import { RAW_KEY } from './constant';

export default function computed(target: IClass, key: string, descriptor: any) {
    const computedKey = Symbol(key);

    const newGet = descriptor.get;

    function get(this: IProxyData | IClass) {
        const self = this[RAW_KEY] || this;
        if (!self[computedKey]) {
            self[computedKey] = {
                observers: new Set(),
                preValue: null,
                newGet: newGet.bind(this),
                observer: null,
                isShouldUpdate: false,
            };
        }
        const obj = self[computedKey];

        if (store.currentObserver) {
            obj.observers.add(store.currentObserver);
            store.currentObserver.bindObservers.add(obj.observers);
        }
        if (!obj.observer) {
            obj.observer = new Obersver(() => {
                obj.isShouldUpdate = true;
                if (obj.observers.size === 0) {
                    obj.observer.unSubscribe();
                    obj.observer = null;
                } else {
                    store.pushQueue(obj.observers);
                }
            }, `${target.constructor.name}.${key}`);

            obj.preValue = obj.observer.collectDep(obj.newGet);
            obj.isShouldUpdate = false;
        } else if (obj.isShouldUpdate) {
            obj.preValue = obj.observer.collectDep(obj.newGet);
            obj.isShouldUpdate = false;
        }
        return obj.preValue;
    }

    descriptor.get = get;
    return descriptor;
}
