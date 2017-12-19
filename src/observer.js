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
    collectDeps(fn) {
        this.clearBinds();
        if (liob.currentObserver) {
            this.preObserver = liob.currentObserver;
        }
        liob.currentObserver = this;
        const res = fn();
        if (this.preObserver) {
            liob.currentObserver = this.preObserver;
            this.preObserver = null;
        } else {
            liob.currentObserver = null;
        }
        return res;
    }

    beginCollectDeps(fn) {
        this.clearBinds();
        if (liob.currentObserver) {
            this.preObserver = liob.currentObserver;
        }
        liob.currentObserver = this;
        const res = fn();
        return res;
    }

    endCollectDeps() {
        if (this.preObserver) {
            liob.currentObserver = this.preObserver;
            this.preObserver = null;
        } else {
            liob.currentObserver = null;
        }
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
        observer.collectDeps(fn);
    }, name);
    ob.run();
    return ob;
}
