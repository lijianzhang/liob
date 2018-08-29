/*
 * @Author: lijianzhang
 * @Date: 2017-12-31 00:36:33
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-29 23:58:39
 */


import { asyncAction, action, observable } from '../es';
import { observe } from '../es/observer';

function delay(time, value, shouldThrow = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldThrow) reject(value);
            else resolve(value);
        }, time);
    });
}


describe('multiple action test', () => {
    test('只触发一次observer的callback', async () => {
        const user = observable({
            name: 'dio',
            age: 18,
        });
        let time = 0;
        observe(() => {
            time += 1;
            user.name; //eslint-disable-line
            user.age; //eslint-disable-line
        });

        await asyncAction(function* test() {
            const name = yield delay(2, 'jz');
            user.name = name;
            user.age = 20;
        })();

        expect(user.name).toBe('jz');
        expect(user.age).toBe(20);
        expect(time).toBe(2);
    });

    test('触发2次observer的callback', async () => {
        const user = observable({
            name: 'dio',
            age: 18,
        });
        let time = 0;
        observe(() => {
            time += 1;
            user.name; //eslint-disable-line
            user.age; //eslint-disable-line
        });

        const action2 = asyncAction(function* action2() {
            user.name = yield 'jz';
        });

        const action1 = asyncAction(function* action1() {
            user.age = yield 20;
            yield delay(0);

            action2();
        });

        await action1();

        expect(user.name).toBe('jz');
        expect(user.age).toBe(20);
        expect(time).toBe(3);
    });


    test('asyncAction支持装饰器', async () => {
        @observable
        class User {
            name = 'Dio';
            age = 18;


            @action
            setAge(age) {
                this.age = age;
            }

            @asyncAction
            setName = function* setName(name) {
                name = yield delay(0, name);
                this.name = name;
            }

            @action set = async function set(name, age) {
                await this.setName(name);
                this.setAge(age);
            }
        }

        const user = new User();
        let time = 0;
        observe(() => {
            time += 1;
            user.age; //eslint-disable-line
            user.name; //eslint-disable-line
        });
        await user.set('jz', 20);
        expect(user.name).toBe('jz');
        expect(user.age).toBe(20);
        expect(time).toBe(3);
    });
});
