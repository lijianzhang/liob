/*
 * @Author: lijianzhang
 * @Date: 2018-08-29 21:34:11
 * @Last Modified by: lijianzhang
 * @Last Modified time: 2018-08-30 00:34:16
 */
import Observer from './observer';
import useLog from './log';

export class Store {

    queue: Set<number> = new Set();

    onError(error) {
        throw error;
    }

    stack = 0;

    useDebug = false;

    public useLog() {
        const unLog = useLog();
        this.unLog = () => {
            unLog();
            this.unLog = undefined;
        };
        return this.unLog;
    }

    unLog?: Function;

    public observers: Map<number, Observer> = new Map();

    public currentObservers: Observer[] = [];

    get currentObserver() {
        if (this.currentObservers.length === 0) return null;
        return this.currentObservers[this.currentObservers.length - 1];
    }

    private readyToRun: boolean = false;

    pushQueue(ids: Set<number>) {
        ids.forEach(id => this.queue.add(id));

        if (!this.inAction && !this.readyToRun) {
            Promise.resolve().then(this.runQueue);
            this.readyToRun = true;
        }
    }
  
    runQueue = () => {
        this.readyToRun = false;
        if (this.queue.size === 0) return;
        this.queue.forEach(id => this.observers.get(id).run());
        this.queue.clear();
    };
  
    get inAction(): boolean {
        return this.stack > 0;
    }
}

const store = new Store();

export default store;