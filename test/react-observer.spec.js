import React, { Component } from 'react';
import { mount } from 'enzyme';
import { reactObserver, observable, action } from '../src';

describe('react-observer', () => {
    test('数据源发生改变 react组件会重新渲染', () => {
        @observable
        class Store {
            num = 1;

            @action
            addNum() {
                this.num += 1;
            }
        }

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
        expect(app.text()).toBe('2');
    });
});
