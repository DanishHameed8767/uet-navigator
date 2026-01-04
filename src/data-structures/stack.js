class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class CustomStack {
    constructor() {
        this.top = null;
        this.size = 0;
    }

    push(data) {
        const newNode = new Node(data);
        if (this.top === null) {
            this.top = newNode;
        } else {
            newNode.next = this.top;
            this.top = newNode;
        }
        this.size++;
    }

    pop() {
        if (this.top === null) {
            return null;
        }
        const poppedNode = this.top;
        this.top = this.top.next;
        this.size--;
        return poppedNode.data;
    }

    peek() {
        if (this.top === null) {
            return null;
        }
        return this.top.data;
    }

    isEmpty() {
        return this.size === 0;
    }

    toArray() {
        const result = [];
        let current = this.top;
        while (current !== null) {
            result.push(current.data);
            current = current.next;
        }
        return result.reverse();
    }

    clear() {
        this.top = null;
        this.size = 0;
    }
}

export default CustomStack;
