import React from 'react';
import { PROXY_KEY, OBSERVER_KEY, RAW_KEY, OBSERVER_COMPONENT_KEY } from './constant';
import Observer from './observer';

export interface IProxyData {
    [PROXY_KEY]?: ProxyConstructor;
    [OBSERVER_KEY]?: Map<string | number | symbol, Set<Observer>>;
    [RAW_KEY]: {} | any[];
    [s: string]: any;
    [n: number]: any;
}

export interface IClass {
    new(...args: any[]): {};
    __proto__?: any;
}


export type IObserverComponet = React.Component & { [OBSERVER_COMPONENT_KEY]: Observer }

export type ObserverSFC = React.SFC<{children?: React.SFC<any>; render?: React.SFC<any> }>;

