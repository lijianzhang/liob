/*
 * @Author: lijianzhang
 * @Date: 2018-08-29 21:36:27
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 21:37:18
 */

/**
 * @param {any} fn
 */
export function isFunction(fn: any) {
    return typeof fn === 'function';
}

export function invariant(cond: boolean, message: string = 'Illegal state') {
    if (!cond) throw new Error(`[liob-error] ${message}`);
}

export function isObservableObject(obj: any) {
    if (Array.isArray(obj)) return true;
    if (typeof obj !== 'object' || obj === null || obj instanceof Date || obj.nodeType || obj.setInterval) return false;

    return true;
}