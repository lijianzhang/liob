/* eslint-disable */

import { observable, computed } from '../src';


describe('computed test', () => {

    test('should only run once of computed', () => {
        let i = 0;
        @observable
        class Store {
                num = 1;

                @computed
                get number() {
                    i += 1;
                    return this.num;
                }

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
        store.num += 1;
        expect(store.number).toEqual(2);
        expect(i).toEqual(2);
    });
});
