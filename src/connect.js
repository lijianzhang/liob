import Observer from './observer';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const willRender = Symbol('willRender');
const connectKey = Symbol('connect');

function reactiveRender() {
    this[willRender] = true;
    const res = this.$observer.collectDeps(this[baseRenderKey]);
    this[isReCollectDepsKey] = false;
    this[willRender] = false;
    return res;
}

function initRender() {
    this.$observer = new Observer(() => {
        if (!this[willRender] && !this[isReCollectDepsKey]) {
            this[isReCollectDepsKey] = true;
            this.forceUpdate();
        }
    }, `${this.constructor.name}.render()`);
    this[isReCollectDepsKey] = true;
    this.render = reactiveRender;
    return reactiveRender.call(this);
}

const reactiveMixin = {
    componentWillMount() {
        this[baseRenderKey] = this.render.bind(this);
        this.render = initRender;
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
        target[funcName] = runMixinFirst === true ? function funcName(...args) {
            mixinFunc.apply(this, args);
            base.apply(this, args);
        } : function funcName(...args) {
            base.apply(this, args);
            mixinFunc.apply(this, args);
        };
    }
}

export default function connect(target) {
    if (target[connectKey]) return target;
    target[connectKey] = true;
    patch(target.prototype, 'componentWillMount', true);
    patch(target.prototype, 'componentWillUnmount');

    return target;
}
