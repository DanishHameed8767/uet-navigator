/**
 * A* Pathfinding Algorithm
 * @param {number[][]} matrix - 0 = Wall, 1 = Path
 * @param {Object} start - {row, col}
 * @param {Object} end - {row, col}
 * @returns {Array} - Array of objects [{row, col}, ...] or null if no path
 */
export const findPath = (matrix, start, end) => {
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Helper to check bounds and obstacles
    const isValid = (r, c) => {
        return r >= 0 && r < rows && c >= 0 && c < cols && matrix[r][c] === 1;
    };

    // 8 Directions (Up, Down, Left, Right, Diagonals)
    // Cost: 1 for straight, 1.414 (Math.sqrt(2)) for diagonal
    const neighbors = [
        { r: -1, c: 0, cost: 1 },
        { r: 1, c: 0, cost: 1 }, // Up, Down
        { r: 0, c: -1, cost: 1 },
        { r: 0, c: 1, cost: 1 }, // Left, Right
        { r: -1, c: -1, cost: 1.414 },
        { r: -1, c: 1, cost: 1.414 }, // Diagonals
        { r: 1, c: -1, cost: 1.414 },
        { r: 1, c: 1, cost: 1.414 },
    ];

    const openSet = new MinHeap();
    const closedSet = new Set(); // Stores "row,col" strings

    // Initialize Start Node
    const startNode = {
        r: start.row,
        c: start.col,
        g: 0, // Cost from start
        h: heuristic(start, end), // Estimated cost to end
        f: 0, // Total cost (g + h)
        parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (!openSet.isEmpty()) {
        const current = openSet.pop();

        // Check if we reached the target
        if (current.r === end.row && current.c === end.col) {
            return reconstructPath(current);
        }

        const currentKey = `${current.r},${current.c}`;
        if (closedSet.has(currentKey)) continue;
        closedSet.add(currentKey);

        // Check Neighbors
        for (const dir of neighbors) {
            const newR = current.r + dir.r;
            const newC = current.c + dir.c;

            if (!isValid(newR, newC)) continue;
            if (closedSet.has(`${newR},${newC}`)) continue;

            // Calculate costs
            const gScore = current.g + dir.cost;
            const hScore = heuristic({ row: newR, col: newC }, end);
            const fScore = gScore + hScore;

            // Add to Open Set
            // Note: In a production optimized A*, we would check if node exists in openSet
            // with a lower cost. For simplicity/speed here, we just push.
            openSet.push({
                r: newR,
                c: newC,
                g: gScore,
                h: hScore,
                f: fScore,
                parent: current,
            });
        }
    }

    // No path found
    return null;
};

// Heuristic: Octile Distance (Better than Manhattan for 8-way movement)
const heuristic = (node, end) => {
    const dx = Math.abs(node.row - end.row);
    const dy = Math.abs(node.col - end.col);
    return dx + dy + (1.414 - 2) * Math.min(dx, dy);
};

const reconstructPath = (node) => {
    const path = [];
    let temp = node;
    while (temp) {
        path.push({ row: temp.r, col: temp.c });
        temp = temp.parent;
    }
    return path.reverse(); // Return from Start -> End
};

// --- MinHeap Implementation (Crucial for A* speed) ---
class MinHeap {
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
