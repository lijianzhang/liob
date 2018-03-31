/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import { mount } from 'enzyme';
import { reactObserver, observable, action, useLog } from '../src';

describe('react-observer', () => {
    @observable
    class Store {
            num = 1;

            @action
            addNum() {
                this.num += 1;
            }
    }

    test('When the observable data changes, the component will be re-rendered', () => {
        const store = new Store();

        const unlog = useLog();

        @reactObserver
        class App extends Component {
            render() {
                return <div>{store.num}</div>;
            }
        }

        const app = mount(<App />);
        expect(app.text()).toBe('1');
        store.addNum();
        unlog();
        expect(app.text()).toBe('2');
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
