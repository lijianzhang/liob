import Observer from './observer';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const connectKey = Symbol('connect');
const $deep = Symbol('deep');

function reactiveRender() {
    let res = null;
    if (this.$deep) {
        this.$observer.beginCollectDep();
        res = this[baseRenderKey]();
    } else {
        res = this.$observer.collectDep(this[baseRenderKey]);
    }
    this[isReCollectDepsKey] = false;
    return res;
}

function initRender() {
    this.$observer = new Observer(() => {
        if (!this[isReCollectDepsKey]) {
            this[isReCollectDepsKey] = true;
            this.forceUpdate();
        }
    }, `${this.name || this.displayName || this.constructor.name || this.constructor.displayName}.render()`);

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

    componentDidMount() {
        this.$observer.endCollectDep();
    },
    componentDidUpdate() {
        this.$observer.endCollectDep();
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

export default function ReactObserver(target, opts) {
    if (typeof target === 'object') {
        return c => ReactObserver(c, target);
    }

    if (target[connectKey]) return target;
    target[connectKey] = true;
    patch(target.prototype, 'componentWillMount', true);
    patch(target.prototype, 'componentWillUnmount');

    if (opts && opts.deep) {
        patch(target.prototype, 'componentDidMount', true);
        patch(target.prototype, 'componentDidUpdate', true);
        target.prototype.$deep = $deep;
    }

    return target;
}
