/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:33:47
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-03-31 21:38:32
 * @flow
 */
class Event {
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
