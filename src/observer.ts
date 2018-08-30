
/*
 * @Author: lijianzhang
 * @Date: 2018-08-29 22:41:33
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-30 01:45:07
 */
import store from "./store";

let id = 0;

export default class Observer {
    constructor(cb: Function, name?: string) {
        id += 1;
        this.id = id;
        this.callback = cb;
        this.name = name;
    }

    name?: string;

    public readonly id: number;

    public callback: Function | null;

    public bindObservers: Set<Set<Observer>> = new Set();

    private depChanged = true;

    collectDep(fn: Function) {
        this.beginCollectDep();
        const res = fn();
        this.endCollectDep();
        return res;
    }

    beginCollectDep() {
        if (this.depChanged) {
            this.clearBinds();
            store.currentObservers.push(this);
        }
    }

    endCollectDep() {
        if (this.depChanged) {
            const index = store.currentObservers.indexOf(this);
            store.currentObservers.splice(index, 1);
        }
        this.depChanged = false;
    }
    clearBinds() {
        this.bindObservers.forEach((observers) => {
            observers.delete(this);
        });
        this.bindObservers.clear();
    }

    unSubscribe() {
        this.clearBinds();
        this.callback = null;
    }

    public run() {
        this.depChanged = true;
        if (this.callback) this.callback(this);
    }
}

export function observe(fn: Function, name: string = 'observe') {
    if (!fn) throw new Error('you need set callBack');
    const ob = new Observer((observer) => {
        observer.collectDep(fn);
    }, name);
    ob.run();
    return ob;
}
