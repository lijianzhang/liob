class Event {
    listenerMap = new Map();

    on(type, fn) {
        if (this.listenerMap.has(type)) this.listenerMap.get(type).add(fn);
        else this.listenerMap.set(type, new Set([fn]));
        return () => this.unListener(type, fn);
    }

    unListener(type, fn) {
        this.listenerMap.get(type).delete(fn);
    }

    emit(type, data) {
        const fns = this.listenerMap.get(type);
        if (fns) {
            fns.forEach((listener) => {
                listener(data);
            });
        }
    }
}

export default new Event();
