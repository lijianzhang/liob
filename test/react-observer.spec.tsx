/* eslint-disable react/no-multi-comp */

import * as React from 'react';
import { mount } from 'enzyme';
import { reactObserver, observable, action, ObserverComponent } from '../src';

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


    test('When the observable data change, the SFCComponent will re-render', async () => {
        const store = new Store();
        class App extends React.Component {
            render() {
                return (
                    <ObserverComponent>
                        {() => <div>{store.num}</div>}
                    </ObserverComponent>
                )
            }
        }
        class App1 extends React.Component {
            render() {
                return (
                    <ObserverComponent render={() => <div>{store.num}</div>} />
                )
            }
        }

        function App3() {
            return <div>{store.num}</div>;
        }

        const app = mount(<App />);
        expect(app.text()).toBe('1');
        store.addNum();
        await delay(100);

        expect(app.text()).toBe('2');


        const app1 = mount(<App1 />);
        expect(app1.text()).toBe('2');
        store.addNum();
        await delay(100);

        expect(app1.text()).toBe('3');

        const ObserverApp3 = reactObserver(App3);

        const app3 = mount(<ObserverApp3 />);
        expect(app3.text()).toBe('3');
        store.addNum();
        await delay(100);

        expect(app3.text()).toBe('4');

        await delay(100);
    })
});
