import CustomMap from "./map";

export default class CustomSet {
    constructor(iterable = null) {
        this._map = new CustomMap();
        if (iterable) {
            for (const value of iterable) {
                this.add(value);
            }
        }
    }

    add(value) {
        this._map.set(value, value);
        return this;
    }

    has(value) {
        return this._map.has(value);
    }

    delete(value) {
        return this._map.delete(value);
    }

    clear() {
        this._map.clear();
    }

    get size() {
        return this._map.size;
    }

    forEach(callback, thisArg) {
        this._map.forEach((val, key) => {
            callback.call(thisArg, val, val, this);
        });
    }

    *values() {
        for (const key of this._map.keys()) {
            yield key;
        }
    }

    [Symbol.iterator]() {
        return this.values();
    }
}

try {
    window.Set = CustomSet;
    globalThis.Set = CustomSet;
    console.log("Custom Set Data Structure Injected");
} catch (e) {
    console.error("Failed to inject custom set structure", e);
}
