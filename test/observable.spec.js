/* eslint-disable */

import { observable, toObservable, event, store, PROXY_KEY, RAW_KEY, asyncAction } from '../es';


describe('multiple observable test', () => {
    test('obj and toObservable(obj)should equal', () => {
        const obj = {};
        const proxy = toObservable(obj);
        expect(proxy[RAW_KEY]).toEqual(obj);
    });

    test('observable on set will change', () => {
        let count = 0;
        const unEvent = event.on('set', () => {
            count += 1;
        });

        const obj = toObservable({});

        obj.name = 'liob';
        obj.age = 1;

        expect(count).toBe(2);
        unEvent();
    });

    test('decorative observable', async () => {
        @observable
        class User {
            name;
            age;

        }
        

        const user = new User();
        let count = 0;
        const unEvent = event.on('set', () => {
            count += 1;
        });

        user.name = 'liob';
        user.age = 1;

        expect(count).toBe(2);
    });
});
