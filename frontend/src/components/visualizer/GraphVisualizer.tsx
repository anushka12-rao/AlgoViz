import React, { useMemo } from 'react';
import { EngineEvent } from '../../types/engine';

export interface GraphVisualizerProps {
  currentEvent: EngineEvent | null;
  algorithmId: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  currentEvent,
  algorithmId,
}) => {
  const adj = currentEvent?.graph_adj ?? [];
  const visited = currentEvent?.graph_visited ?? [];
  const queue = currentEvent?.graph_queue ?? [];
  const traversal = currentEvent?.graph_traversal ?? [];
  const currentVertex = currentEvent?.current_vertex ?? -1;
  const activeIndices = new Set(currentEvent?.active_indices ?? []);
  const isDFS = algorithmId === 'dfs';

  // Determine number of vertices from stats, adj, or visited array
  const vertexCount = useMemo(() => {
    if (currentEvent?.stats?.vertices) {
      return currentEvent.stats.vertices;
    }
    if (adj.length > 0) return adj.length;
    if (visited.length > 0) return visited.length;
    return 5;
  }, [currentEvent, adj, visited]);

  // Compute circular layout coordinates for all vertices
  const { vertexPositions, canvasWidth, canvasHeight } = useMemo(() => {
    const width = 420;
    const height = 360;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 48;

    const positions: Array<{ id: number; x: number; y: number }> = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (2 * Math.PI * i) / vertexCount - Math.PI / 2;
      positions.push({
        id: i,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }

    return { vertexPositions: positions, canvasWidth: width, canvasHeight: height };
  }, [vertexCount]);

  // Extract unique undirected edges from adjacency list
  const edges = useMemo(() => {
    const list: Array<{ u: number; v: number; isSelfLoop: boolean; key: string }> = [];
    const seen = new Set<string>();

    for (let u = 0; u < adj.length; u++) {
      const neighbors = adj[u] ?? [];
      for (const v of neighbors) {
        const edgeKey = u <= v ? `${u}-${v}` : `${v}-${u}`;
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          list.push({
            u,
            v,
            isSelfLoop: u === v,
            key: edgeKey,
          });
        }
      }
    }
    return list;
  }, [adj]);

  return (
    <div
      className="graph-visualizer-container"
      data-testid="graph-visualizer"
      aria-label={isDFS ? 'Graph DFS Traversal Visualization' : 'Graph BFS Traversal Visualization'}
    >
      <div className="graph-header">
        <span className="graph-title">
          {isDFS ? 'Graph Depth-First Search (DFS)' : 'Graph Breadth-First Search (BFS)'}
        </span>
        <span className="graph-meta-badge" data-testid="graph-vertex-count">
          Vertices: {vertexCount} | Edges: {edges.length}
        </span>
      </div>

      <div className="graph-main-layout">
        {/* SVG Graph Canvas */}
        <div className="graph-canvas-wrapper">
          <svg
            className="graph-svg"
            width={canvasWidth}
            height={canvasHeight}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            data-testid="graph-svg-canvas"
          >
            {/* 1. Edges Layer */}
            <g className="graph-edges" data-testid="graph-edges">
              {edges.map((edge) => {
                const posU = vertexPositions[edge.u];
                const posV = vertexPositions[edge.v];
                if (!posU || !posV) return null;

                const isActiveEdge =
                  activeIndices.has(edge.u) && activeIndices.has(edge.v) && edge.u !== edge.v;

                if (edge.isSelfLoop) {
                  return (
                    <circle
                      key={edge.key}
                      cx={posU.x}
                      cy={posU.y - 20}
                      r={14}
                      className={`graph-edge-loop ${isActiveEdge ? 'edge-active' : ''}`}
                      data-testid={`graph-edge-${edge.key}`}
                    />
                  );
                }

                return (
                  <line
                    key={edge.key}
                    x1={posU.x}
                    y1={posU.y}
                    x2={posV.x}
                    y2={posV.y}
                    className={`graph-edge-line ${isActiveEdge ? 'edge-active' : ''}`}
                    data-testid={`graph-edge-${edge.key}`}
                  />
                );
              })}
            </g>

            {/* 2. Vertices Layer */}
            <g className="graph-vertices" data-testid="graph-vertices">
              {vertexPositions.map((pos) => {
                const isCurrent = currentVertex === pos.id;
                const isVisited = visited[pos.id] === true;
                const isQueued = queue.includes(pos.id) && !isVisited;

                let nodeClass = 'graph-vertex-circle';
                if (isCurrent) nodeClass += ' vertex-current';
                else if (isVisited) nodeClass += ' vertex-visited';
                else if (isQueued) nodeClass += ' vertex-queued';

                return (
                  <g
                    key={pos.id}
                    className="graph-vertex-group"
                    transform={`translate(${pos.x}, ${pos.y})`}
                    data-testid={`graph-vertex-${pos.id}`}
                  >
                    <circle
                      r={18}
                      className={nodeClass}
                      data-testid={`graph-vertex-circle-${pos.id}`}
                    />
                    <text className="graph-vertex-text" dy="0.35em" textAnchor="middle">
                      {pos.id}
                    </text>
                    {isCurrent && (
                      <text className="vertex-active-tag" y={-24} textAnchor="middle">
                        ACTIVE
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Telemetry Sidebar */}
        <div className="graph-telemetry-panel" data-testid="graph-telemetry">
          {/* Queue / Call Stack Card */}
          <div className="telemetry-card" data-testid="queue-stack-card">
            <div className="telemetry-title">
              {isDFS ? 'Active Call Stack (LIFO)' : 'Active BFS Queue (FIFO)'}
            </div>
            <div className="telemetry-items">
              {queue.length === 0 ? (
                <span className="telemetry-empty-label">Empty</span>
              ) : (
                queue.map((vertex, qIdx) => {
                  const isTop = isDFS && qIdx === queue.length - 1;
                  const isFront = !isDFS && qIdx === 0;

                  return (
                    <span
                      key={qIdx}
                      className={`telemetry-chip ${isTop ? 'chip-top' : ''} ${
                        isFront ? 'chip-front' : ''
                      }`}
                      data-testid={`queue-chip-${vertex}`}
                    >
                      v{vertex}
                      {isTop && <small> (TOP)</small>}
                      {isFront && <small> (FRONT)</small>}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Visited / Traversal Progress Card */}
          <div className="telemetry-card" data-testid="traversal-card">
            <div className="telemetry-title">Traversal Sequence</div>
            <div className="telemetry-items">
              {traversal.length === 0 ? (
                <span className="telemetry-empty-label">
                  {currentVertex !== -1 ? `Starting at v${currentVertex}` : 'None'}
                </span>
              ) : (
                traversal.map((v, tIdx) => (
                  <span key={tIdx} className="telemetry-chip chip-traversed" data-testid={`traversal-chip-${v}`}>
                    {v}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Visited Status Grid */}
          <div className="telemetry-card">
            <div className="telemetry-title">Visited Status</div>
            <div className="visited-grid">
              {Array.from({ length: vertexCount }).map((_, idx) => (
                <div
                  key={idx}
                  className={`visited-cell ${visited[idx] ? 'cell-visited' : 'cell-unvisited'}`}
                  data-testid={`visited-cell-${idx}`}
                >
                  <span className="cell-num">{idx}</span>
                  <span className="cell-flag">{visited[idx] ? '✓' : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
