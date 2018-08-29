/* eslint-disable react/no-multi-comp */

import * as React from 'react';
import { mount } from 'enzyme';
import { reactObserver, observable, action } from '../src';

function delay(time, value: any = 0, shouldThrow = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldThrow) reject(value);
            else resolve(value);
        }, time);
    });
}

describe('react-observer', () => {

    @observable
    class Store {
            num = 1;

            @action
            addNum() {
                this.num += 1;
            }
    }

    test('When the observable data changes, the component will be re-rendered', async () => {
        const store = new Store();
        @reactObserver
        class App extends React.Component {
            render() {
                return <div>{store.num}</div>;
            }
        }

        const app = mount(<App />);
        expect(app.text()).toBe('1');
        store.addNum();
        await delay(1000);

        expect(app.text()).toBe('2');

        await delay(1000);
    });
});
