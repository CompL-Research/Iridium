import GLIB from "#graphlib";

function reversePostOrder(graph, root) {
  const visited = new Set();
  const result = [];

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);

    const neighbors = graph.successors(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor);
    }
    
    result.push(node); // post-order: add after visiting children
  }

  dfs(root);
  return result.reverse(); // reverse post-order
}

// Example usage
const g = new GLIB.Graph();
g.setEdge('A', 'B');
g.setEdge('A', 'C');
g.setEdge('B', 'D');
g.setEdge('C', 'D');
g.setEdge('D', 'E');

console.log(reversePostOrder(g, 'A')); // Expected: reverse post-order nodes