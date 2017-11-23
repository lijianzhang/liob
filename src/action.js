import liob from './liob';
import event from './event';

export function runAction(fn, ...args) {
    liob.stack += 1;
    event.emit('action', `${this.constructor.name}.${fn.name}`);
    const value = fn.call(this, ...args);
    liob.stack -= 1;
    if (liob.stack === 0) {
        liob.runQueue();
    }

    return value;
}

export default function decorativeAction(target, key, descriptor) {
    if (key && descriptor) {
        const { value } = descriptor;
        descriptor.value = function wrapAction(...args) {
            runAction.call(this, value, ...args);
        };
        return descriptor;
    }
    return (...args) => runAction(target, ...args);
}
