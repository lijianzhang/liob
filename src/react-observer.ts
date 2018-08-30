/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:40:26
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:50:29
 * @flow
 */
import * as React from 'react';
import { SFC } from 'react';
import Observer from './observer';
import { OBSERVER_COMPONENT_KEY } from './constant';

const baseRenderKey = Symbol('baseRender');
const isReCollectDepsKey = Symbol('isReCollectDeps');
const connectKey = Symbol('connect');
const $componentWillMount = Symbol('componentWillMount');

type IReactComponent<P = any> =
    | React.StatelessComponent<P>
    | React.ComponentClass<P>
    | React.ClassicComponentClass<P>;

function reactiveRender(this: React.Component) {
    return this[OBSERVER_COMPONENT_KEY].collectDep(this[baseRenderKey]);
}

function initRender(this: React.Component) {
    this[OBSERVER_COMPONENT_KEY] = new Observer(() => {
        if (!this[isReCollectDepsKey] && this[$componentWillMount]) {
            this[isReCollectDepsKey] = true;
            this.forceUpdate();
        }
    }, `${this.constructor.name}.render()`);

    this.render = reactiveRender;
    return reactiveRender.call(this);
}

const reactiveMixin = {
    componentWillMount(this: React.Component) {
        this[$componentWillMount] = true;
        this[baseRenderKey] = this.render.bind(this);
        this.render = initRender;
    },

    componentWillUnmount(this: React.Component) {
        this[OBSERVER_COMPONENT_KEY].unSubscribe();
        this[OBSERVER_COMPONENT_KEY] = null;
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
                function funcName(this: React.Component, ...args) {
                    mixinFunc.apply(this, args);
                    base.apply(this, args);
                } :
                function funcName(this: React.Component, ...args) {
                    base.apply(this, args);
                    mixinFunc.apply(this, args);
                };
    }
}


function createObserverComponent(component: IReactComponent) {
    return class extends React.Component {
        static displayName = component.displayName || component.name;
        static propTypes = component.propTypes;
        static contextTypes = component.contextTypes;
        static defaultProps = component.defaultProps;

        render() {
            return component.call(this, this.props, this.context);
        }
    };
}


export default function ReactObserver<T extends IReactComponent>(target: T | SFC): T {
    if (target[connectKey]) return (target as T);
    if ( typeof target === "function" && (target.prototype && target.prototype.render) ) {
        target[connectKey] = true;
        patch(target.prototype, 'componentWillMount', true);
        patch(target.prototype, 'componentWillUnmount');
        return (target as T);
    }

    return ReactObserver(createObserverComponent(target as IReactComponent)) as any;
    
}

interface Props {
    children?: SFC | React.Factory<any> ;
    render?: SFC;
}

export function ObserverComponent(target: Props) {

    let Component = target.children || target.render;
    if (!Component) return null;
    return React.createElement(ReactObserver(Component));
}
