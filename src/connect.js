import Observer from './observer';
import liob from './liob';

export default function connect(Target) {
    return class extends Target {
        isReCollectDeps = false;


        componentWillMount() {
            if (liob.currentObserver) {
                this.preObserver = liob.currentObserver;
            }
            if (super.componentWillMount) super.componentWillMount();
        }


        componentDidMount() {
            if (this.preObserver) {
                liob.currentObserver = this.preObserver;
                this.preObserver = null;
            } else {
                liob.currentObserver = null;
            }
            if (super.componentDidMount) super.componentDidMount();
        }


        componentWillUpdate(nextProps, nextState) {
            if (this.isReCollectDeps) {
                if (liob.currentObserver) {
                    this.preObserver = liob.currentObserver;
                }
                liob.currentObserver = this.observer;
            }


            if (super.componentWillUpdate) {
                super.componentWillUpdate(nextProps, nextState);
            }
        }

        componentDidUpdate(prevProps, prevState) {
            if (this.preObserver) {
                liob.currentObserver = this.preObserver;
                this.preObserver = null;
            } else {
                liob.currentObserver = null;
            }

            if (super.componentDidUpdate) {
                super.componentDidUpdate(prevProps, prevState);
            }
        }

        componentWillUnmount() {
            if (super.componentWillUnmount) {
                super.componentWillUnmount();
            }

            this.observer.unSubscribe();
            this.observer = null;
        }


        initRender() {
            this.observer = new Observer(() => {
                this.isReCollectDeps = true;
                this.forceUpdate();
            }, this.name || this.displayName || Target.name);

            const res = this.observer.collectDeps(this.supRender.bind(this));
            liob.currentObserver = this.observer;
            console.log('end collectDeps');
            this.render = this.reactiveRender;
            return res;
        }

        reactiveRender() {
            if (this.isReCollectDeps) {
                const res = this.observer.collectDeps(this.supRender.bind(this));
                liob.currentObserver = this.observer;
                console.log('end collectDeps');
                this.isReCollectDeps = false;
                return res;
            }
            return this.supRender.call(this);
        }

        render() {
            this.supRender = super.render;


            return this.initRender();
        }
    };
}
