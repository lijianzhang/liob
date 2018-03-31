/*
 * @Author: lijianzhang
 * @Date: 2017-12-31 00:36:33
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-03-31 21:55:29
 */


import { action, observable } from '../src';
import { observe } from '../src/observer';


describe('multiple action test', () => {
    test('observe only run one time', () => {
        const obj = observable({
            a: 1,
            b: 1,
        });
        let time = 0;
        observe(() => {
            time += 1;
            obj.a; //eslint-disable-line
            obj.b; //eslint-disable-line
        });

        action(() => {
            obj.a = 2;
            obj.b = 2;
        })();

        expect(time).toBe(2);
    });

    test('nested action only run one time observe', () => {
        const obj = observable({
            a: 1,
            b: 1,
        });
        let time = 0;
        observe(() => {
            time += 1;
            obj.a; //eslint-disable-line
            obj.b; //eslint-disable-line
        });

        const action2 = action(() => {
            obj.b = 2;
        });

        const action1 = action(() => {
            obj.a = 2;
            action2();
        });

        action1();

        expect(time).toBe(2);
    });


    test('class action function', () => {
        @observable
        class User {
            name = 'Dio';
            age = 18;

            @action
            setAge(age) {
                this.age = age;
            }

            @action
            setName(name) {
                this.name = name;
            }

            @action set(name, age) {
                this.setAge(age);
                this.setName(name);
            }
        }

        const user = new User();
        let time = 0;
        observe(() => {
            time += 1;
            user.age; //eslint-disable-line
            user.name; //eslint-disable-line
        });
        user.set('jz', 20);

        expect(time).toBe(2);
    });
});
