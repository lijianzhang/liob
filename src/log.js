import event from './event';

export default function useLog() {
    event.on('action', (name) => {
        console.group('%c %s %c %s', 'color: #03A9F4;', 'action', 'color: #666', name);
    });

    event.on('endAction', () => {
        console.groupEnd();
    });

    event.on('component:Observer', (name) => {
        console.log('%c %s %c %s.render', 'color: #4CAF50;', 'Observer: ', 'color: #666', name);
    });

    event.on('computed', (name) => {
        console.log('%c %s %c %s', 'color: #4CAF50;', 'recount: ', 'color: #666', name);
    });
}

