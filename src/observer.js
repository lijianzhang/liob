import liob from './liob';

export default class Observer {
    constructor(callBack, name) {
        /**
         * 每次依赖被修改的时候都会触发callBack
         */
        this.callBack = callBack;
        this.name = name;
    }

    bindObservers = new Set();

    /** 执行fn并对fn进行依赖收集 */
    collectDep(fn) {
        this.beginCollectDep();
        const res = fn();
        this.endCollectDep();
        return res;
    }

    beginCollectDep() {
        this.clearBinds();
        liob.currentObserver = this;
    }

    endCollectDep() {
        const index = liob.collectObservers.indexOf(this);
        liob.collectObservers.splice(index, 1);
    }

    clearBinds() {
        this.bindObservers.forEach((observers) => {
            observers.delete(this);
        });
        this.bindObservers.clear();
    }

    run() {
        if (this.callBack) this.callBack(this);
    }

    unSubscribe() {
        this.clearBinds();
        this.callBack = null;
    }
}

export function observe(fn, name = 'observe') {
    if (!fn) throw new Error('you need set callBack');
    const ob = new Observer((observer) => {
        observer.collectDep(fn);
    }, name);
    ob.run();
    return ob;
}
