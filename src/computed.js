import Obersver from './observer';
import liob from './liob';

export default function computed(target, key, descriptor) {
    function initGet() {
        let newGet = descriptor.get;
        let isShouldUpdate;
        let preValue;
        let observer = null;
        const observers = new Set();

        return function get() {
            if (liob.currentObserver) {
                observers.add(liob.currentObserver);
                liob.currentObserver.bindObservers.add(observers);
            }
            if (!observer) {
                newGet = newGet.bind(this);
                observer = new Obersver(() => {
                    isShouldUpdate = true;
                    if (observers.size === 0) {
                        observer.unSubscribe();
                        observer = null;
                    } else {
                        liob.pushQueue(observers);
                    }
                }, `${target.constructor.name}.${key}`);
                preValue = observer.collectDeps(newGet);
                isShouldUpdate = false;
            } else if (isShouldUpdate) {
                preValue = observer.collectDeps(newGet);
                isShouldUpdate = false;
            }
            return preValue;
        };
    }

    descriptor.get = initGet();
    return descriptor;
}
