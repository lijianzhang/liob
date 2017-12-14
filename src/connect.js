import Observer from './observer';
import liob from './liob';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const preObserverKey = Symbol('preObserver');
const connectKey = Symbol('connect');

function reactiveRender() {
    const res = this.$observer.collectDeps(this[baseRenderKey]);
    liob.currentObserver = this.$observer;
    this[isReCollectDepsKey] = false;
    if (liob.currentObserver) {
        this[preObserverKey] = liob.currentObserver;
    }
    liob.currentObserver = this.$observer;
    return res;
}

function initRender() {
    this.$observer = new Observer(() => {
        if (!this[isReCollectDepsKey]) {
            this[isReCollectDepsKey] = true;
            this.forceUpdate();
        }
    }, `${this.name || this.displayName || this.constructor.displayName || this.constructor.displayName}.render()`);

    this.render = reactiveRender;
    return reactiveRender.call(this);
}

const reactiveMixin = {
    componentWillMount() {
        this[baseRenderKey] = this.render.bind(this);
        this.render = initRender;
    },

    componentDidMount() {
        if (this[preObserverKey]) {
            liob.currentObserver = this[preObserverKey];
            this[preObserverKey] = null;
        } else {
            liob.currentObserver = null;
        }
    },

    componentDidUpdate() {
        if (this[preObserverKey]) {
            liob.currentObserver = this[preObserverKey];
            this[preObserverKey] = null;
        } else {
            liob.currentObserver = null;
        }
    },
    componentWillUnmount() {
        this.$observer.unSubscribe();
        this.$observer = null;
    },
};

function patch(target, funcName, runMixinFirst = false) {
    const base = target[funcName];
    const mixinFunc = reactiveMixin[funcName];
    if (!base) {
        target[funcName] = mixinFunc;
    } else {
        target[funcName] =
            runMixinFirst === true ?
                function funcName(...args) {
                    mixinFunc.apply(this, args);
                    base.apply(this, args);
                } :
                function funcName(...args) {
                    base.apply(this, args);
                    mixinFunc.apply(this, args);
                };
    }
}

export default function connect(target) {
    if (target[connectKey]) return target;
    target[connectKey] = true;
    patch(target.prototype, 'componentWillMount', true);
    patch(target.prototype, 'componentDidMount');
    patch(target.prototype, 'componentDidUpdate', true);
    patch(target.prototype, 'componentWillUnmount');

    return target;
}
