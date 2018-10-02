
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
        store.observers.set(this.id, this);
    }

    name?: string;

    public readonly id: number;

    public callback: Function | null;

    public bindObservers: Set<Set<number>> = new Set();

    private _change = true;

    public get change() {
        return this._change;
    }

    collectDep(fn: Function) {
        this.beginCollectDep();
        const res = fn();
        this.endCollectDep();
        return res;
    }

    beginCollectDep() {
        if (this._change) {
            this.clearBinds();
            store.currentObservers.push(this);
        }
    }

    endCollectDep() {
        if (this._change) {
            const index = store.currentObservers.indexOf(this);
            store.currentObservers.splice(index, 1);
        }
        this._change = false;
    }
    clearBinds() {
        this.bindObservers.forEach((observers) => {
            observers.delete(this.id);
        });
        this.bindObservers.clear();
    }

    unSubscribe() {
        this.clearBinds();
        this.callback = null;
    }

    public run() {
        this._change = true;
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
