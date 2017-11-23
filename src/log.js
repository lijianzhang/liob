import event from './event';

export default function useLog() {
    event.on('action', (name) => {
        console.log('%c %s %c %s', 'color: #ff5a5e;', 'action', 'color: #666', name);
    });

    event.on('component:reaction', (name) => {
        console.log('%c %s %c %s.render', 'color: #ff5a5e;', 'component:reaction', 'color: #666', name);
    });
}

