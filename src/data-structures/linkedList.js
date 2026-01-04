class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class SingleLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    append(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }

    prepend(data) {
        const newNode = new Node(data);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
    }

    update(data) {
        let current = this.head;
        while (current) {
            if (current?.data?.email === data.email) {
                current.data = data;
                return;
            }
            current = current.next;
        }
    }

    remove(data) {
        if (!this.head) return null;
        if (this.head.data === data) {
            this.head = this.head.next;
            this.size--;
            return;
        }
        let current = this.head;
        let prev = null;
        while (current && current.data !== data) {
            prev = current;
            current = current.next;
        }
        if (current) {
            prev.next = current.next;
            this.size--;
        }
    }

    print() {
        let current = this.head;
        let result = "";
        while (current) {
            result += current.data + " -> ";
            current = current.next;
        }
        console.log(result + "null");
    }

    find(email) {
        let current = this.head;
        while (current) {
            if (current?.data?.email === email) {
                return current.data;
            }
            current = current.next;
        }
        return null;
    }

    toArray() {
        let arr = [];
        let current = this.head;
        while (current) {
            arr = [...arr, current.data];
            current = current.next;
        }
        return arr;
    }

    deepCopy() {
        const newList = new SingleLinkedList();
        let current = this.head;
        while (current) {
            newList.append(current.data);
            current = current.next;
        }
        return newList;
    }
}

export default SingleLinkedList;
