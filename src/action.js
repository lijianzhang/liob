/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:31:41
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-03-31 21:32:51
 * @flow
 */
import liob from './liob';
import event from './event';

export function runAction(fn: Function, ...args: Array<any>) {
    liob.stack += 1;
    const value = fn.call(this, ...args);
    liob.stack -= 1;
    if (liob.stack === 0) {
        liob.runQueue();
    }

    return value;
}

export default function decorativeAction(target: Function, key: string, descriptor: any) {
    if (key && descriptor) {
        const { value } = descriptor;
        descriptor.value = function wrapAction(...args) {
            event.emit('action', `${target.constructor.name}.${key}`);
            const res = runAction.call(this, value, ...args);
            event.emit('endAction', `${target.constructor.name}.${key}`);
            return res;
        };
        return descriptor;
    }
    return (...args: Array<any>) => runAction(target, ...args);
}
