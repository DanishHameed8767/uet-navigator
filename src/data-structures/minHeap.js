export default class MinHeap {
    constructor() {
        this.heap = [];
    }
    push(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(n) {
        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            if (this.heap[n].f >= this.heap[parentN].f) break;
            [this.heap[parentN], this.heap[n]] = [
                this.heap[n],
                this.heap[parentN],
            ];
            n = parentN;
        }
    }
    sinkDown(n) {
        const length = this.heap.length;
        while (true) {
            const leftChildN = 2 * n + 1;
            const rightChildN = 2 * n + 2;
            let swap = null;

            if (leftChildN < length) {
                if (this.heap[leftChildN].f < this.heap[n].f) {
                    swap = leftChildN;
                }
            }
            if (rightChildN < length) {
                if (
                    (swap === null &&
                        this.heap[rightChildN].f < this.heap[n].f) ||
                    (swap !== null &&
                        this.heap[rightChildN].f < this.heap[swap].f)
                ) {
                    swap = rightChildN;
                }
            }
            if (swap === null) break;
            [this.heap[n], this.heap[swap]] = [this.heap[swap], this.heap[n]];
            n = swap;
        }
    }
}
