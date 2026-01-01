import MinHeap from '../data-structures/minHeap.js'
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
        // NEW: Smooth the path before returning
        if (current.r === end.row && current.c === end.col) {
            const rawPath = reconstructPath(current);
            return simplifyPath(matrix, rawPath); // <--- The Magic Step
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

const simplifyPath = (matrix, path) => {
    if (path.length < 3) return path;

    const smoothPath = [path[0]];
    let lastNode = path[0];

    // Greedy simplification
    for (let i = 1; i < path.length; i++) {
        // Check if we can walk straight from 'lastNode' to 'path[i+1]'
        // If we CANNOT, then we must keep 'path[i]' as a turning point.
        // We look ahead to i+1 to see if we can skip the current node (path[i])

        const nextTarget = path[i + 1];
        if (!nextTarget) {
            smoothPath.push(path[i]); // Always keep the very last node
            break;
        }

        if (!hasLineOfSight(matrix, lastNode, nextTarget)) {
            // Path blocked, so we definitely need the current node
            smoothPath.push(path[i]);
            lastNode = path[i];
        }
        // If we DO have line of sight to nextTarget, we assume we can skip path[i]
        // and loop continues to try and skip more.
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
        // Check for Wall
        // Note: We might want to be conservative and check neighbors
        // if the path is too tight, but for now strict center-line check:
        if (matrix[y0][x0] === 0) {
            return false; // Hit a wall
        }

        if (x0 === x1 && y0 === y1) break;

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
    return true; // Path is clear
};

// Heuristic: Octile Distance with Tie-Breaker
const heuristic = (node, end) => {
    const D = 1;
    const D2 = 1.414;
    const dx = Math.abs(node.row - end.row);
    const dy = Math.abs(node.col - end.col);

    // Standard Octile distance
    const h = D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);

    // --- THE FIX: TIE-BREAKER ---
    // Nudge the heuristic slightly to prefer paths that
    // strictly reduce distance to goal.
    return h * 1.001;
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
