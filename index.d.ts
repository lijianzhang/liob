
export function action<T, K extends string>(target: T, key: K, descriptor: PropertyDescriptor): PropertyDescriptor;

export function observable<T>(target: T): T;

export function reactObserver<T>(target: T): T;

export function Observer<T>(target: T): T;

export function asyncAction(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor;

export function asyncAction<T>(generator: (a1: T) => IterableIterator<any>): (a1: T) => Promise<any>;

