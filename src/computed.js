import Obersver from './observer';
import liob from './liob';
import event from './event';

export default function computed(target, key, descriptor) {
    let newGet = descriptor.get;
    let isShouldUpdate;
    let preValue;
    let observer;
    let isFisrt = true;
    const observers = new Set();

    function initGet() {
        if (liob.currentObserver) {
            observers.add(liob.currentObserver);
        }
        if (isFisrt) {
            newGet = newGet.bind(this);
            observer = new Obersver(() => {
                isShouldUpdate = true;
                liob.pushQueue(observers);
                observers.clear();
            }, `${target.constructor.name}.${key}`);
            preValue = observer.collectDeps(newGet);
            isShouldUpdate = false;
            isFisrt = false;
        } else if (isShouldUpdate) {
            event.emit('computed', `${target.constructor.name}->get${key}()`);
            preValue = observer.collectDeps(newGet);
            isShouldUpdate = false;
        }

        return preValue;
    }

    descriptor.get = initGet;
    return descriptor;
}
