/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 20:30:17
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-03-31 20:31:31
 * @flow
 */


/**
 * 是否是方法
 * @param {any} fn
 */
export function isFunction(fn: any) {
    return typeof fn === 'function';
}

/**
 * 是否是基本类型
 * @param {*any} value
 */
export function isPrimitive(value: any) {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
        return true;
    }

    return false;
}

export function invariant(cond: boolean, message: string = 'Illegal state') {
    if (!cond) throw new Error(`[liob-error] ${message}`);
}

export function isObservableObject(obj: any) {
    // 判断是否非window和DOM对象的对象，
    if (Array.isArray(obj)) return true;
    if (!obj || obj.toString() !== '[object Object]' || obj.nodeType || obj.setInterval) {
        return false;
    }
    return true;
}
