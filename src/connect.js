import Observer from './observer';
import liob from './liob';

function reactiveRender() {
    if (this.isReCollectDeps) {
        const res = this.observer.collectDeps(this.baseRender.bind(this));
        liob.currentObserver = this.observer;
        this.isReCollectDeps = false;
        return res;
    }
    return this.baseRender();
}

function initRender() {
    this.observer = new Observer(() => {
        this.isReCollectDeps = true;
        this.forceUpdate();
    }, this.name || this.displayName || this.constructor.name);

    const res = this.observer.collectDeps(this.baseRender.bind(this));
    liob.currentObserver = this.observer;
    this.render = reactiveRender.bind(this);
    return res;
}

const reactiveMixin = {
    componentWillMount() {
        if (liob.currentObserver) {
            this.preObserver = liob.currentObserver;
        }
        this.baseRender = this.render;
        this.render = initRender.call(this);
    },

    componentDidMount() {
        if (this.preObserver) {
            liob.currentObserver = this.preObserver;
            this.preObserver = null;
        } else {
            liob.currentObserver = null;
        }
    },

    componentWillUpdate() {
        if (this.isReCollectDeps) {
            if (liob.currentObserver) {
                this.preObserver = liob.currentObserver;
            }
            liob.currentObserver = this.observer;
        }
    },

    componentDidUpdate() {
        if (this.preObserver) {
            liob.currentObserver = this.preObserver;
            this.preObserver = null;
        } else {
            liob.currentObserver = null;
        }
    },

    componentWillUnmount() {
        this.observer.unSubscribe();
        this.observer = null;
    },
};

function patch(target, funcName, runMixinFirst = false) {
    const base = target[funcName];
    const mixinFunc = reactiveMixin[funcName];
    if (!base) {
        target[funcName] = mixinFunc;
    } else {
        target[funcName] =
            runMixinFirst === true
                ? function funcName(...args: any[]) {
                    mixinFunc.apply(this, args);
                    base.apply(this, args);
                }
                : function funcName(...args: any[]) {
                    base.apply(this, args);
                    mixinFunc.apply(this, args);
                };
    }
}

export default function connect(target) {
    patch(target.prototype, 'componentWillMount', true);
    patch(target.prototype, 'componentDidMount');
    patch(target.prototype, 'componentWillUpdate', true);
    patch(target.prototype, 'componentDidUpdate');
    patch(target.prototype, 'componentWillUnmount');

    return target;
}
