import { observe, observable } from '../src';
import liob from '../src/liob';

/* eslint-disable no-unused-expressions */

describe('multiple observer test', () => {
    test('observer should run again', () => {
        let count = 0;
        const obj = observable({ test: 'test' });
        observe(() => {
            count += 1;
            obj.test; //eslint-disable-line
        });
        obj.test = 'test1';
        Promise.resolve().then(() => {
            expect(count).toEqual(2);
        });
    });

    test('should only run once of observe', () => {
        let count = 0;
        const obj = observable({ test: 'test', name: null });
        observe(() => {
            count += 1;
            obj.name; //eslint-disable-line
        });
        obj.test = 'test1';
        obj.test = 'test2';
        Promise.resolve().then(() => {
            expect(count).toEqual(1);
        });
    });

    test('should run twice of observe', () => {
        let count = 0;
        const obj = observable({ test: 'test', name: null });
        observe(() => {
            count += 1;
            obj.name; //eslint-disable-line
        });
        delete obj.name;
        Promise.resolve().then(() => {
            expect(count).toEqual(2);
        });
    });

    test('liob currentObserver should equal observe', () => {
        // const user = observable({ name: 'liob', age: 0 });
        let currentObserver = null;
        const ob = observe(() => {
            currentObserver = liob.currentObserver; //eslint-disable-line
        });
        expect(currentObserver).toEqual(ob);
    });

    test('should retrun 3 of observe.bindObservers.size', () => {
        const user1 = observable({ name: 'liob', age: 0 });
        const user2 = observable({ name: 'liob2', age: 1 });

        const ob = observe(() => {
            user1.name;
            user1.age;
            user2.name;
        });

        expect(ob.bindObservers.size).toBe(3);
    });

    test('callBack and bindObservers should be equal to empty when executing unSubscribe', () => {
        const user = observable({ name: 'liob', age: 0 });
        const ob = observe(() => {
            user.name; //eslint-disable-line
        });

        expect(ob.bindObservers.size).toEqual(1);
        ob.unSubscribe();
        expect(ob.bindObservers.size).toEqual(0);
        expect(ob.callBack).toBeNull();
    });

    test('observe need set callBack', () => {
        expect(() => observe()).toThrowError();
    });

    test('...', () => {
        const user1 = observable({ name: 'liob', age: 0 });
        const user2 = observable({ name: 'liob2', age: 1 });

        let currentObserver1 = null;
        let currentObserver2 = null;
        let currentObserver3 = null;
        let ob2 = null;

        const ob = observe(() => {
            currentObserver1 = liob.currentObserver;
            ob2 = observe(() => {
                currentObserver2 = liob.currentObserver;
                user2.name;
            });
            user1.name;
            currentObserver3 = liob.currentObserver;
        });
        expect(currentObserver1).toEqual(ob);
        expect(currentObserver2).toEqual(ob2);
        expect(currentObserver3).toEqual(ob);
    });
});

/* eslint-enable */
