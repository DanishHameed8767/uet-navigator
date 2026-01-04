const UID_KEY = "___custom_hash_id_" + Math.random().toString(36).substr(2, 9);
let uidCounter = 0;

function getHash(key) {
    if (key === null) {
        return "Primitive_NULL";
    }
    if (key === undefined) {
        return "Primitive_UNDEFINED";
    }
    if (typeof key === "symbol") {
        return "Primitive_Symbol_" + String(key);
    }
    if (typeof key !== "object" && typeof key !== "function") {
        return "Primitive_" + typeof key + "_" + key;
    }
    if (!Object.isExtensible(key)) {
        if (Object.prototype.hasOwnProperty.call(key, UID_KEY)) {
            return "Object_" + key[UID_KEY];
        }
        return null;
    }
    if (!Object.prototype.hasOwnProperty.call(key, UID_KEY)) {
        Object.defineProperty(key, UID_KEY, {
            value: ++uidCounter,
            writable: true,
            enumerable: false,
            configurable: true,
        });
    }
    return "Object_" + key[UID_KEY];
}

export default class CustomMap {
    constructor(iterable = null) {
        this._items = {};
        this._frozenItems = [];
        this._keys = [];
        this._size = 0;

        if (iterable) {
            for (const [key, value] of iterable) {
                this.set(key, value);
            }
        }
    }

    set(key, value) {
        const hash = getHash(key);
        if (hash !== null) {
            if (!Object.prototype.hasOwnProperty.call(this._items, hash)) {
                this._deleteFrozen(key);
                this._size++;
                this._keys.push(key);
            }
            this._items[hash] = value;
        } else {
            const existingIdx = this._findFrozenIndex(key);
            if (existingIdx === -1) {
                this._frozenItems.push({ key, value });
                this._size++;
                this._keys.push(key);
            } else {
                this._frozenItems[existingIdx].value = value;
            }
        }
        return this;
    }

    get(key) {
        const hash = getHash(key);
        if (hash !== null) {
            return this._items[hash];
        }
        const idx = this._findFrozenIndex(key);
        return idx !== -1 ? this._frozenItems[idx].value : undefined;
    }

    has(key) {
        const hash = getHash(key);
        if (hash !== null) {
            return Object.prototype.hasOwnProperty.call(this._items, hash);
        }
        return this._findFrozenIndex(key) !== -1;
    }

    delete(key) {
        const hash = getHash(key);
        if (hash !== null) {
            if (Object.prototype.hasOwnProperty.call(this._items, hash)) {
                delete this._items[hash];
                this._size--;
                this._removeFromKeys(key);
                return true;
            }
        } else {
            return this._deleteFrozen(key);
        }
        return false;
    }

    clear() {
        this._items = {};
        this._frozenItems = [];
        this._keys = [];
        this._size = 0;
    }

    get size() {
        return this._size;
    }

    forEach(callback, thisArg) {
        for (const key of this._keys) {
            callback.call(thisArg, this.get(key), key, this);
        }
    }

    *entries() {
        for (const key of this._keys) {
            yield [key, this.get(key)];
        }
    }

    *keys() {
        for (const key of this._keys) {
            yield key;
        }
    }

    *values() {
        for (const key of this._keys) {
            yield this.get(key);
        }
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    _findFrozenIndex(key) {
        for (let i = 0; i < this._frozenItems.length; i++) {
            if (this._frozenItems[i].key === key) {
                return i;
            }
        }
        return -1;
    }

    _deleteFrozen(key) {
        const idx = this._findFrozenIndex(key);
        if (idx !== -1) {
            this._frozenItems.splice(idx, 1);
            this._size--;
            this._removeFromKeys(key);
            return true;
        }
        return false;
    }

    _removeFromKeys(key) {
        const index = this._keys.indexOf(key);
        if (index > -1) {
            this._keys.splice(index, 1);
        }
    }
}

try {
    window.Map = CustomMap;
    globalThis.Map = CustomMap;
    console.log("Custom Map Data Structure Injected");
} catch (e) {
    console.error("Failed to inject custom map structure", e);
}
