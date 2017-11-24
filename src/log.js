import event from './event';

export default function useLog() {
    event.on('action', (name) => {
        console.group('%c %s %c %s', 'color: #03A9F4;', 'action', 'color: #666', name);
    });

    event.on('endAction', () => {
        console.groupEnd();
    });

    event.on('Observer', (name) => {
        console.log('%c %s %c %s', 'color: #666;', 'Observer: ', 'color: #666', name);
    });

    event.on('set', ({
        target, key, oldValue, value,
    }) => {
        console.log('%c set: %o %c %s oldValue %o => %c newValue %o', 'color: #ff4a4e;', target, 'color: #666', key, oldValue, 'color: #03A9F4;', value); //eslint-disable-line
    });
}

