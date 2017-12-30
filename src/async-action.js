import { runAction } from './action';
import { invariant } from './utils';

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
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


async function loopNext(gen, res = {}) {
    if (res.done) return res.value;
    res = runAction.call(gen, gen.next, res.value);
    if (res.value && res.value.then) {
        res.value = await res.value;
    }
    return loopNext(gen, res);
}


export async function asyncAction(fn, ...args) {
    invariant(isGeneratorFunction(fn), `${fn.name || 'fn'} must be a generator function`);
    const generator = fn.call(this, ...args);
    if (!generator.next) return generator;
    let res;
    try {
        res = await loopNext(generator);
    } catch (e) {
        throw e;
    }
    return res;
}


export default function decorativeAsyncAction(target, key, descriptor) {
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
    return (...args) => asyncAction(target, ...args);
}

