import cloneDeep from 'lodash.clonedeep';
import event from './event';

export default function useLog() {
    event.on('action', (name) => {
        console.time(name);
        console.group('%c %s %c %s', 'color: #03A9F4;', 'action', 'color: #666', name);
    });

    event.on('endAction', (name) => {
        console.timeEnd(name);
        console.groupEnd();
    });

    event.on('Observer', (name) => {
        console.log('%c %s %c %s', 'color: #2196F3;', 'Observer: ', 'color: #666', name);
    });

    event.on('set', ({
        target, key, oldValue, value,
    }) => {
        console.log('%c set: %o %c %s %c oldValue %o => %c newValue %o', 'color: #ff4a4e;', target, 'color: #009688;', key,'color: #263238;', cloneDeep(oldValue), 'color: #03A9F4;', cloneDeep(value)); //eslint-disable-line
    });
}

