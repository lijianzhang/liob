import observable, { toObservable } from '../src/observable';
import event from '../src/event';
import liob from '../src/liob';

describe('multiple observable test', () => {
    test('obj and toObservable(obj)should equal', () => {
        const obj = {};
        expect(toObservable(obj)).toEqual(obj);
        expect(liob.dataToProxy.has(obj)).toBeTruthy();
    });

    test('obj and observable(obj)should equal', () => {
        const obj = {};
        expect(observable(obj)).toEqual(obj);
    });

    test('observable on set will change', () => {
        let count = 0;
        const unEvent = event.on('set', () => {
            count += 1;
        });

        const obj = observable({});

        obj.name = 'liob';
        obj.age = 1;

        expect(count).toBe(2);
        unEvent();
    });

    test('decorative observable', () => {
        @observable
        class User {
            name;
            age;
        }

        const user = new User();
        expect(liob.proxys.has(user)).toBeTruthy();
    });
});
