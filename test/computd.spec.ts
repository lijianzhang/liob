/* eslint-disable */

import { observable, computed, action } from '../src';
import { delay } from './utils';

describe('computed test', () => {
    test('should only run once of computed', async () => {
        let i = 0;

        @observable
        class Store {
                num = 1;

                @computed
                get number() {
                    i += 1;
                    return this.num;
                }
                @action
                addNum() {
                    this.num += 1;
                }
        }
        const store = new Store();
        store.number;
        store.number;
        store.number;
        store.number;
        expect(i).toEqual(1);
        expect(store.number).toEqual(1);
        store.addNum();
        expect(store.number).toEqual(2);
        expect(i).toEqual(2);

        store.num += 1;

        await delay(1);
        expect(store.number).toEqual(3);
        expect(i).toEqual(3);
    });
});
