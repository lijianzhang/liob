import liob from './liob';

export function runAction(fn, ...args) {
    liob.stack += 1;
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
