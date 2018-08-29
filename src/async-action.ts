/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:30:17
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:11:59
 */
import { runAction } from './action';
import { invariant } from './utils';

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj?: Iterator<any>) {
    if (!obj) return false;
    return typeof obj.next === 'function' && typeof obj.throw === 'function';
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
    const { constructor } = obj;
    if (!constructor) return false;
    if (constructor.name === 'GeneratorFunction' || constructor.displayName === 'GeneratorFunction') return true;
    return isGenerator(constructor.prototype);
}


async function loopNext(gen, res: IteratorResult<any> = { done: false, value: null }) {
    if (res.done) return res.value;
    res = runAction.call(gen, gen.next, res.value);
    if (res.value && res.value.then) {
        res.value = await res.value;
    }
    return loopNext(gen, res);
}


export async function asyncAction(this: any, fn: Function, ...args: Array<any>) {
    invariant(isGeneratorFunction(fn), `${fn.name || 'fn'} must be a generator function`);
    const generator = fn.call(this, ...args);

    const res = await loopNext(generator);

    return res;
}


export default function decorativeAsyncAction(target: Function, key: string, descriptor: any) {
    if (key && descriptor) {
        const { value, initializer } = descriptor;
        if (value) {
            descriptor.value = function wrapAction(...args) {
                return asyncAction.call(this, value, ...args);
            };
        } else if (initializer) {
            descriptor.value = function wrapAction(...args) {
                return asyncAction.call(this, initializer(), ...args);
            };
            delete descriptor.initializer;
        }
        return descriptor;
    }
    return (...args: Array<any>) => asyncAction(target, ...args);
}

