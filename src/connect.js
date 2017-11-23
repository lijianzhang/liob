import Observer from './observer';
import liob from './liob';
import event from './event';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const preObserverKey = Symbol('preObserver');
const willRender = Symbol('willRender');

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
        this[isReCollectDepsKey] = true;
        if (!this[willRender]) {
            this.forceUpdate();
            event.emit('component:reaction', this.constructor.name);
        }
    }, this.constructor.name);

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
    },

    componentDidUpdate() {
        this[willRender] = false;
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
    patch(target.prototype, 'componentWillMount', true);
    patch(target.prototype, 'componentDidMount');
    patch(target.prototype, 'componentWillUpdate', true);
    patch(target.prototype, 'componentDidUpdate', true);
    patch(target.prototype, 'componentWillUnmount');

    return target;
}
