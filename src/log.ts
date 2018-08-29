/* eslint-disable no-console */
/*
 * @Author: lijianzhang
 * @Date: 2018-03-31 21:38:41
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:16:36
 * @flow
 */

import event from './event';

export default function useLog() {
    const unAction = event.on('action', (name) => {
        console.time(name);
        console.group('%c %s %c %s', 'color: #03A9F4;', 'action', 'color: #666', name);
    });

    const unEndAction = event.on('endAction', (name) => {
        console.timeEnd(name);
        console.groupEnd();
    });

    const unObserver = event.on('Observer', (name) => {
        console.log('%c %s %c %s', 'color: #2196F3;', 'Observer: ', 'color: #666', name);
    });

    const unSet = event.on('set', ({
        target, key, value,
    }) => {
        console.log('%c set: %o %c %s %c newValue %o', 'color: #ff4a4e;', target, 'color: #009688;', key, 'color: #03A9F4;', value); //eslint-disable-line
    });

    return () => {
        unAction();
        unEndAction();
        unObserver();
        unSet();
    };
}

