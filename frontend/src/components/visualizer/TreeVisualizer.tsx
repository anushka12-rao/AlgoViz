import React, { useMemo } from 'react';
import { EngineEvent, TreeNodeRecord } from '../../types/engine';

export interface TreeVisualizerProps {
  currentEvent: EngineEvent | null;
  algorithmId: string;
}

interface NodePosition {
  record: TreeNodeRecord;
  x: number;
  y: number;
  depth: number;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  currentEvent,
  algorithmId,
}) => {
  const tree = currentEvent?.tree_state ?? [];
  const action = currentEvent?.action ?? '';
  const traversalArray = currentEvent?.array_state ?? [];
  const pivotVal = currentEvent?.pivot_val;
  const isBST = algorithmId === 'bst';

  // Build ID to record map
  const { nodeMap, rootId } = useMemo(() => {
    const map = new Map<number, TreeNodeRecord>();
    const childIds = new Set<number>();

    for (const node of tree) {
      map.set(node.id, node);
      if (node.left_id !== -1) childIds.add(node.left_id);
      if (node.right_id !== -1) childIds.add(node.right_id);
    }

    let root: number | null = null;
    if (tree.length > 0) {
      // Root is the node not present in childIds, or fallback to node 0
      for (const node of tree) {
        if (!childIds.has(node.id)) {
          root = node.id;
          break;
        }
      }
      if (root === null) root = tree[0].id;
    }

    return { nodeMap: map, rootId: root };
  }, [tree]);

  // Compute deterministic coordinates using In-Order X positioning + Depth Y positioning
  const { positions, edges, width, height } = useMemo(() => {
    if (tree.length === 0 || rootId === null) {
      return { positions: new Map<number, NodePosition>(), edges: [], width: 400, height: 200 };
    }

    const inOrderOrder: number[] = [];
    const depthMap = new Map<number, number>();
    let maxDepth = 0;

    // 1. Traverse to calculate depths
    const computeDepth = (id: number, depth: number) => {
      depthMap.set(id, depth);
      if (depth > maxDepth) maxDepth = depth;
      const node = nodeMap.get(id);
      if (!node) return;
      if (node.left_id !== -1) computeDepth(node.left_id, depth + 1);
      if (node.right_id !== -1) computeDepth(node.right_id, depth + 1);
    };
    computeDepth(rootId, 0);

    // 2. In-order traversal to determine horizontal order (guarantees zero edge crossings)
    const inOrderWalk = (id: number) => {
      const node = nodeMap.get(id);
      if (!node) return;
      if (node.left_id !== -1) inOrderWalk(node.left_id);
      inOrderOrder.push(id);
      if (node.right_id !== -1) inOrderWalk(node.right_id);
    };
    inOrderWalk(rootId);

    const xSpacing = 64;
    const ySpacing = 72;
    const paddingX = 48;
    const paddingY = 48;

    const computedPositions = new Map<number, NodePosition>();
    inOrderOrder.forEach((id, inOrderIdx) => {
      const node = nodeMap.get(id)!;
      const depth = depthMap.get(id) ?? 0;
      computedPositions.set(id, {
        record: node,
        x: paddingX + inOrderIdx * xSpacing,
        y: paddingY + depth * ySpacing,
        depth,
      });
    });

    // 3. Build edge list
    const computedEdges: Array<{
      from: NodePosition;
      to: NodePosition;
      side: 'L' | 'R';
      key: string;
    }> = [];

    for (const node of tree) {
      const parentPos = computedPositions.get(node.id);
      if (!parentPos) continue;

      if (node.left_id !== -1) {
        const leftPos = computedPositions.get(node.left_id);
        if (leftPos) {
          computedEdges.push({
            from: parentPos,
            to: leftPos,
            side: 'L',
            key: `${node.id}->L->${node.left_id}`,
          });
        }
      }

      if (node.right_id !== -1) {
        const rightPos = computedPositions.get(node.right_id);
        if (rightPos) {
          computedEdges.push({
            from: parentPos,
            to: rightPos,
            side: 'R',
            key: `${node.id}->R->${node.right_id}`,
          });
        }
      }
    }

    const totalWidth = Math.max(480, paddingX * 2 + (inOrderOrder.length - 1) * xSpacing);
    const totalHeight = Math.max(260, paddingY * 2 + maxDepth * ySpacing + 20);

    return {
      positions: computedPositions,
      edges: computedEdges,
      width: totalWidth,
      height: totalHeight,
    };
  }, [tree, nodeMap, rootId]);

  return (
    <div
      className="tree-visualizer-container"
      data-testid="tree-visualizer"
      aria-label={isBST ? 'Binary Search Tree Visualization' : 'Binary Tree Visualization'}
    >
      <div className="tree-header">
        <span className="tree-title">
          {isBST ? 'Binary Search Tree (BST)' : 'Binary Tree'}
        </span>
        <span className="tree-node-count" data-testid="tree-node-count">
          Nodes: {tree.length}
        </span>
      </div>

      {tree.length === 0 ? (
        <div className="tree-empty-canvas" data-testid="tree-empty-canvas">
          <p>Tree is currently empty</p>
        </div>
      ) : (
        <div className="tree-canvas-scroll">
          <svg
            className="tree-svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            data-testid="tree-svg-canvas"
          >
            {/* Draw edges first */}
            <g className="tree-edges">
              {edges.map((edge) => (
                <g key={edge.key}>
                  <line
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    className="tree-edge-line"
                    data-testid={`tree-edge-${edge.key}`}
                  />
                  {/* Small direction/branch tag */}
                  <text
                    x={(edge.from.x + edge.to.x) / 2 + (edge.side === 'L' ? -8 : 8)}
                    y={(edge.from.y + edge.to.y) / 2 - 4}
                    className="tree-edge-label"
                  >
                    {edge.side}
                  </text>
                </g>
              ))}
            </g>

            {/* Draw nodes second */}
            <g className="tree-nodes">
              {Array.from(positions.values()).map((pos) => {
                const isRoot = pos.record.id === rootId;
                const isMatch = pivotVal !== undefined && pos.record.val === pivotVal;
                const isSearch = action === 'SEARCH' && isMatch;
                const isDelete = action === 'DELETE' && isMatch;
                const isInsert = action === 'INSERT' && isMatch;

                let nodeClass = 'tree-node-circle';
                if (isSearch) nodeClass += ' node-search-match';
                if (isDelete) nodeClass += ' node-delete-target';
                if (isInsert) nodeClass += ' node-inserted';
                if (isRoot) nodeClass += ' node-root';

                return (
                  <g
                    key={pos.record.id}
                    className="tree-node-group"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    data-testid={`tree-node-${pos.record.id}`}
                  >
                    <circle
                      r={20}
                      className={nodeClass}
                      data-testid={`tree-node-circle-${pos.record.id}`}
                    />
                    <text
                      className="tree-node-text"
                      dy="0.35em"
                      textAnchor="middle"
                      data-testid={`tree-val-${pos.record.id}`}
                    >
                      {pos.record.val}
                    </text>
                    {isRoot && (
                      <text className="tree-root-tag" y={-24} textAnchor="middle">
                        ROOT
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      )}

      {/* Traversal or Sorted Result Ribbon */}
      {traversalArray.length > 0 && (
        <div className="tree-traversal-ribbon" data-testid="tree-traversal-ribbon">
          <div className="ribbon-label">
            {isBST ? 'Sorted Sequence / Output:' : 'Traversal / Sequence:'}
          </div>
          <div className="ribbon-items">
            {traversalArray.map((val, idx) => (
              <span key={idx} className="ribbon-chip" data-testid={`traversal-chip-${idx}`}>
                {val}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
