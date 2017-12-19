import React, { PureComponent } from 'react';
import Observer from './observer';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const connectKey = Symbol('connect');

function reactiveRender() {
    const res = this.$observer.collectDeps(this[baseRenderKey]);
    this[isReCollectDepsKey] = false;
    return res;
}

function initRender() {
    this.$observer = new Observer(() => {
        if (!this[isReCollectDepsKey]) {
            this[isReCollectDepsKey] = true;
            this.forceUpdate();
        }
    }, `${this.name || this.displayName || this.constructor.displayName || this.constructor.name}.render()`);

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

function isReactFunction(obj) {
    if (typeof obj === 'function') {
        if ((obj.prototype && obj.prototype.render) || obj.isReactClass || React.Component.isPrototypeOf(obj)) {
            return true;
        }
    }

    return false;
}

export default function reactObserver(componentClass) {
    if (componentClass[connectKey]) return componentClass;

    if (isReactFunction(componentClass)) {
        componentClass[connectKey] = true;
        patch(componentClass.prototype, 'componentWillMount', true);
        patch(componentClass.prototype, 'componentWillUnmount');
    } else if (typeof componentClass === 'function') {
        return reactObserver(class extends PureComponent {
                static displayName = componentClass.displayName || componentClass.name;
                static contextTypes = componentClass.contextTypes;
                static propTypes = componentClass.propTypes;
                static defaultProps = componentClass.defaultProps;
                render() {
                    return componentClass.call(this, this.props, this.context);
                }
        });
    }

    return componentClass;
}

export const ReactObserver = reactObserver(({ children }) => children());
