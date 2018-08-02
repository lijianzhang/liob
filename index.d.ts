
import React from "react";

export type IReactComponent<P = any> =
    | React.StatelessComponent<P>
    | React.ComponentClass<P>
    | React.ClassicComponentClass<P>;


export function action<T>(target: T, key: string): any;

export function observable<T>(target: T): T;

export function reactObserver<T>(target: T): T;

export function Observer<T extends IReactComponent>(target: T, option: { deep?: boolean }): T;
export function Observer<T extends IReactComponent>(target: T): T;
export class ObserverComponent extends React.Component<
    {
        children?: () => React.ReactNode
        render?: () => React.ReactNode
    },
    {}
> {}

export function asyncAction(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor;

export function asyncAction<T>(generator: (a1: T) => IterableIterator<any>): (a1: T) => Promise<any>;

