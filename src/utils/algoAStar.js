import MinHeap from "../data-structures/minHeap";

/**
 * Standard A* Implementation (Grid Based)
 *
 * @param {number[][]} matrix - 0 = Wall, 1 = Path
 * @param {Object} start - {row, col}
 * @param {Object} end - {row, col}
 * @returns {Object|null} - Standardized Path Object or null
 * {
 * path: Array<{row, col}>,
 * distance: number // Cost/Distance units
 * }
 */

export const calcPathWithAStar = (matrix, start, end) => {
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Helper to check bounds and obstacles
    const isValid = (r, c) => {
        return r >= 0 && r < rows && c >= 0 && c < cols && matrix[r][c] === 1;
    };

    // 8 Directions (Up, Down, Left, Right, Diagonals)
    const neighbors = [
        { r: -1, c: 0, cost: 1 },
        { r: 1, c: 0, cost: 1 },
        { r: 0, c: -1, cost: 1 },
        { r: 0, c: 1, cost: 1 },
        { r: -1, c: -1, cost: 1.414 },
        { r: -1, c: 1, cost: 1.414 },
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
        h: heuristic(start, end),
        f: 0,
        parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (!openSet.isEmpty()) {
        const current = openSet.pop();

        // Target Reached
        if (current.r === end.row && current.c === end.col) {
            const rawPath = reconstructPath(current);
            const smoothedPath = simplifyPath(matrix, rawPath);

            return {
                path: smoothedPath,
                distance: current.g, // Total accumulated cost (distance)
            };
        }

        const currentKey = `${current.r},${current.c}`;
        if (closedSet.has(currentKey)) {
            continue;
        }
        closedSet.add(currentKey);

        // Check Neighbors
        for (const dir of neighbors) {
            const newR = current.r + dir.r;
            const newC = current.c + dir.c;

            if (!isValid(newR, newC)) {
                continue;
            }
            if (closedSet.has(`${newR},${newC}`)) {
                continue;
            }

            const gScore = current.g + dir.cost;
            const hScore = heuristic({ row: newR, col: newC }, end);
            const fScore = gScore + hScore;

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

    return null;
};

// --- Helpers ---

const heuristic = (node, end) => {
    const D = 1;
    const D2 = 1.414;
    const dx = Math.abs(node.row - end.row);
    const dy = Math.abs(node.col - end.col);
    // Octile distance + tie-breaker
    return (D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy)) * 1.001;
};

const reconstructPath = (node) => {
    const path = [];
    let temp = node;
    while (temp) {
        path.push({ row: temp.r, col: temp.c });
        temp = temp.parent;
    }
    return path.reverse();
};

const simplifyPath = (matrix, path) => {
    if (path.length < 3) {
        return path;
    }

    const smoothPath = [path[0]];
    let lastNode = path[0];

    for (let i = 1; i < path.length; i++) {
        const nextTarget = path[i + 1];
        if (!nextTarget) {
            smoothPath.push(path[i]);
            break;
        }

        if (!hasLineOfSight(matrix, lastNode, nextTarget)) {
            smoothPath.push(path[i]);
            lastNode = path[i];
        }
    }

    return smoothPath;
};

const hasLineOfSight = (matrix, start, end) => {
    let x0 = start.col;
    let y0 = start.row;
    const x1 = end.col;
    const y1 = end.row;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        if (matrix[y0][x0] === 0) {
            return false;
        }

        if (x0 === x1 && y0 === y1) {
            break;
        }

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return true;
};
