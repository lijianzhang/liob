/**
 * 是否是方法
 * @param {any} fn
 */
export function isFunction(fn) {
    return typeof fn === 'function';
}

/**
 * 是否是基本类型
 * @param {*any} value
 */
export function isPrimitive(value) {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
        return true;
    }

    return false;
}

export function isComputed(target, key) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if (descriptor && descriptor.get) {
        return descriptor;
    }
    return false;
}
