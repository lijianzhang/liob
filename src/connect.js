import Observer from './observer';
import liob from './liob';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const preObserverKey = Symbol('preObserver');
const willRender = Symbol('willRender');
const connectKey = Symbol('connect');

function reactiveRender() {
    if (this[isReCollectDepsKey]) {
        const res = this.$observer.collectDeps(this[baseRenderKey].bind(this));
        liob.currentObserver = this.$observer;
        this[isReCollectDepsKey] = false;
        return res;
    }
    return this[baseRenderKey]();
}

function initRender() {
    this.$observer = new Observer(() => {
        if (!this[willRender] && !this[isReCollectDepsKey]) {
            this[isReCollectDepsKey] = true;
            this.forceUpdate();
        }
    }, `${this.constructor.name}.render()`);

    const res = this.$observer.collectDeps(this[baseRenderKey].bind(this));
    liob.currentObserver = this.$observer;
    this.render = reactiveRender;
    return res;
}

const reactiveMixin = {
    componentWillMount() {
        if (liob.currentObserver) {
            this[preObserverKey] = liob.currentObserver;
        }
        this[baseRenderKey] = this.render;
        this.render = initRender;
        this[willRender] = true;
    },

    componentDidMount() {
        this[willRender] = false;
        if (this[preObserverKey]) {
            liob.currentObserver = this[preObserverKey];
            this[preObserverKey] = null;
        } else {
            liob.currentObserver = null;
        }
    },

    componentWillUpdate() {
        this[willRender] = true;
        if (this[isReCollectDepsKey]) {
            if (liob.currentObserver) {
                this[preObserverKey] = liob.currentObserver;
            }
            liob.currentObserver = this.$observer;
        }
    },

    componentDidUpdate() {
        this[willRender] = false;
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
            runMixinFirst === true
                ? function funcName(...args) {
                    mixinFunc.apply(this, args);
                    base.apply(this, args);
                }
                : function funcName(...args) {
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
    patch(target.prototype, 'componentWillUpdate', true);
    patch(target.prototype, 'componentDidUpdate', true);
    patch(target.prototype, 'componentWillUnmount');

    return target;
}
