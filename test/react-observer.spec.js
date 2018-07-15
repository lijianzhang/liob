/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import { mount } from 'enzyme';
import { reactObserver, observable, action } from '../src';

function delay(time, value, shouldThrow = false) {
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
        class App extends Component {
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


    test('When the observable data changes, the childen component will be re-rendered', () => {
        const store = new Store();
        const Children = () => <div>{store.num}</div>;

        let didMount = false;

        let willUnmount = false;

        let willMount = false;

        let didUpdate = false;
        @reactObserver({ deep: true })
        class App extends Component {
            componentWillMount() {
                willMount = true;
            }

            componentDidMount() {
                didMount = true;
            }

            componentDidUpdate() {
                didUpdate = true;
            }

            componentWillUnmount() {
                willUnmount = true;
            }

            render() {
                return (
                    <div><Children /></div>
                );
            }
        }
        const app = mount(<App />);

        expect(app.text()).toBe('1');
        expect(willMount).toBe(true);
        expect(didMount).toBe(true);

        store.addNum();
        expect(app.text()).toBe('2');

        expect(didUpdate).toBe(true);
        app.unmount();

        expect(willUnmount).toBe(true);
    });
});
