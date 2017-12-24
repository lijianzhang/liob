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

export function isObservableObject(obj) {
    // 判断是否非window和DOM对象的对象，
    if (Array.isArray(obj)) return true;
    if (!obj || obj.toString() !== '[object Object]' || obj.nodeType || obj.setInterval) {
        return false;
    }
    return true;
}
