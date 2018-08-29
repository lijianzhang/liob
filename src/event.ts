/*
 * @Author: lijianzhang
 * @Date: 2018-08-29 22:38:06
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:56:02
 */

export class Event {
    listenerMap: Map<string, Set<Function>> = new Map();

    on(type: string, fn: Function) {
        const set = this.listenerMap.get(type);
        if (set) {
            set.add(fn);
        } else {
            this.listenerMap.set(type, new Set([fn]));
        }
        return () => this.unListener(type, fn);
    }

    unListener(type: string, fn: Function) {
        const set = this.listenerMap.get(type);
        if (set) set.delete(fn);
    }

    emit(type: string, data: any) {
        const fns = this.listenerMap.get(type);
        if (fns) {
            fns.forEach((listener) => {
                listener(data);
            });
        }
    }
}

export default new Event();
