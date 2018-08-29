/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:31:41
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:53:44
 * @flow
 */
import store from './store';
import event from './event';


export function runAction(this: any, fn: Function, ...args: any[]) {
    store.stack += 1;
    let value;
    try {
        value = fn.call(this, ...args);
    } catch (error) {
        store.onError(error);
    } finally {
        store.stack -= 1;
        if (store.stack === 0) {
            store.runQueue();
        }
    }
    return value;
}



export function decorativeAction(target: any, key: string, descriptor: PropertyDescriptor){
    const { value } = descriptor;
    descriptor.value = function wrapAction(...args) {
        event.emit('action', `${target.constructor.name}.${key}`);
        const res = runAction.call(this, value, ...args);
        event.emit('endAction', `${target.constructor.name}.${key}`);
        return res;
    };
    return descriptor;
}

export function WrapperAction(fn: Function) {
    return (...args: Array<any>) => runAction(fn, ...args)
}
