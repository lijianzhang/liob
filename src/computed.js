import Obersver from './observer';
import liob from './liob';

export default function computed(target, key, descriptor) {
    const computedKey = Symbol(key);

    const newGet = descriptor.get;

    function get() {
        const self = this.$raw || this;
        if (!self[computedKey]) {
            self[computedKey] = {
                observers: new Set(),
                preValue: null,
                newGet: newGet.bind(this),
                observer: null,
                isShouldUpdate: false,
            };
        }
        const obj = self[computedKey];

        if (liob.currentObserver) {
            obj.observers.add(liob.currentObserver);
            liob.currentObserver.bindObservers.add(obj.observers);
        }
        if (!obj.observer) {
            obj.observer = new Obersver(() => {
                obj.isShouldUpdate = true;
                if (obj.observers.size === 0) {
                    obj.observer.unSubscribe();
                    obj.observer = null;
                } else {
                    liob.pushQueue(obj.observers);
                }
            }, `${target.constructor.name}.${key}`);

            obj.preValue = obj.observer.collectDep(obj.newGet);
            obj.isShouldUpdate = false;
        } else if (obj.isShouldUpdate) {
            obj.preValue = obj.observer.collectDep(obj.newGet);
            obj.isShouldUpdate = false;
        }
        return obj.preValue;
    }

    descriptor.get = get;
    return descriptor;
}
