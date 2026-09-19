import React, { useState, useEffect } from 'react';

export interface VisualizerInputFormProps {
  algorithmId: string;
  category: string;
  isLoading: boolean;
  onSubmit: (payloadOrArray: any, target?: number) => void;
}

const PRESETS = {
  sorting: [
    { label: 'Random (10)', array: [34, 12, 89, 45, 23, 67, 8, 91, 52, 19] },
    { label: 'Nearly Sorted', array: [10, 20, 25, 30, 45, 40, 50, 60] },
    { label: 'Reverse Sorted', array: [50, 40, 30, 20, 10] },
    { label: 'Duplicates', array: [5, 2, 8, 5, 2, 9, 8, 1] },
  ],
  searching: [
    { label: 'Found (Mid)', array: [10, 20, 30, 40, 50, 60, 70], target: 40 },
    { label: 'Found (Edge)', array: [10, 20, 30, 40, 50, 60, 70], target: 10 },
    { label: 'Not Found', array: [10, 20, 30, 40, 50, 60, 70], target: 99 },
    { label: 'Unsorted Input', array: [50, 20, 10, 40, 30], target: 40 },
  ],
  stack: [
    {
      label: 'Basic LIFO (Push 30, Top, Pop, Empty)',
      elements: [10, 20],
      operations: [
        { op: 'push', val: 30 },
        { op: 'top' },
        { op: 'pop' },
        { op: 'empty' },
      ],
    },
    {
      label: 'Overflow Trigger (Push 8 items)',
      elements: [1, 2, 3, 4, 5, 6, 7],
      operations: [{ op: 'push', val: 8 }],
    },
    {
      label: 'Underflow Trigger (Pop empty)',
      elements: [],
      operations: [{ op: 'pop' }, { op: 'top' }],
    },
  ],
  queue: [
    {
      label: 'Basic FIFO (Enqueue 30, Front, Dequeue)',
      elements: [10, 20],
      operations: [
        { op: 'push', val: 30 },
        { op: 'front' },
        { op: 'pop' },
        { op: 'empty' },
      ],
    },
    {
      label: 'Underflow Trigger (Dequeue empty)',
      elements: [],
      operations: [{ op: 'pop' }, { op: 'front' }],
    },
    {
      label: 'Alternating Enqueue/Dequeue',
      elements: [5, 10],
      operations: [
        { op: 'push', val: 15 },
        { op: 'pop' },
        { op: 'push', val: 20 },
        { op: 'front' },
      ],
    },
  ],
  linked_list: [
    {
      label: 'Head & Tail Insertions',
      elements: [10, 20],
      operations: [
        { op: 'push_front', val: 5 },
        { op: 'push_back', val: 30 },
        { op: 'search', val: 20 },
        { op: 'pop_front' },
      ],
    },
    {
      label: 'Search Key 20 (Found)',
      elements: [5, 10, 20, 25],
      operations: [{ op: 'search', val: 20 }],
    },
    {
      label: 'Search Missing Key 99',
      elements: [5, 10, 20, 25],
      operations: [{ op: 'search', val: 99 }],
    },
  ],
  binary_tree: [
    {
      label: 'Balanced Tree (7 nodes)',
      preorder: [1, 2, 4, -1, -1, 5, -1, -1, 3, 6, -1, -1, 7, -1, -1],
    },
    {
      label: 'Left-Skewed Tree',
      preorder: [1, 2, 3, -1, -1, -1, -1],
    },
    {
      label: 'Single Root Node',
      preorder: [42, -1, -1],
    },
  ],
  bst: [
    {
      label: 'Balanced BST (7 nodes)',
      values: [50, 30, 70, 20, 40, 60, 80],
      search_target: 40,
      delete_target: 30,
    },
    {
      label: 'Delete Leaf Node',
      values: [50, 30, 70],
      delete_target: 30,
    },
    {
      label: 'Delete Root (2 Children)',
      values: [50, 30, 70, 20, 40, 60, 80],
      delete_target: 50,
    },
    {
      label: 'Duplicate Rejection',
      values: [50, 30, 50, 70, 30],
    },
  ],
  graphs: [
    {
      label: 'Connected Tree Graph (5 nodes)',
      vertices: 5,
      edges: '0-1, 0-2, 1-3, 2-4',
      src: 0,
    },
    {
      label: 'Disconnected Components',
      vertices: 5,
      edges: '0-1, 2-3',
      src: 0,
    },
    {
      label: 'Cycle with Self-Loop',
      vertices: 4,
      edges: '0-1, 1-2, 2-0, 2-2',
      src: 0,
    },
    {
      label: 'Star Graph (5 nodes)',
      vertices: 5,
      edges: '0-1, 0-2, 0-3, 0-4',
      src: 0,
    },
  ],
};

export const VisualizerInputForm: React.FC<VisualizerInputFormProps> = ({
  algorithmId,
  category,
  isLoading,
  onSubmit,
}) => {
  const isSorting = category === 'sorting';
  const isSearching = category === 'searching';
  const isDataStructure = category === 'data_structures';
  const isGraph = category === 'graphs';

  // 1. Sorting & Searching state
  const [arrayStr, setArrayStr] = useState<string>(
    isSearching ? '10, 20, 30, 40, 50, 60, 70' : '34, 12, 89, 45, 23, 67, 8, 91, 52, 19'
  );
  const [targetVal, setTargetVal] = useState<number>(40);

  // 2. Data Structures state
  const [dsElementsStr, setDsElementsStr] = useState<string>('10, 20');
  const [dsOperations, setDsOperations] = useState<any[]>([
    { op: 'push', val: 30 },
    { op: 'top' },
    { op: 'pop' },
  ]);

  // 3. Binary Tree state
  const [preorderStr, setPreorderStr] = useState<string>(
    '1, 2, 4, -1, -1, 5, -1, -1, 3, -1, -1'
  );

  // 4. BST state
  const [bstValuesStr, setBstValuesStr] = useState<string>('50, 30, 70, 20, 40, 60, 80');
  const [bstSearchTarget, setBstSearchTarget] = useState<string>('40');
  const [bstDeleteTarget, setBstDeleteTarget] = useState<string>('30');

  // 5. Graph state
  const [graphVertices, setGraphVertices] = useState<number>(5);
  const [graphSrc, setGraphSrc] = useState<number>(0);
  const [graphEdgesStr, setGraphEdgesStr] = useState<string>('0-1, 0-2, 1-3, 2-4');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Binary search unsorted notice
  const isBinarySearch = algorithmId === 'binary_search';
  const [isUnsortedNotice, setIsUnsortedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!isBinarySearch) {
      setIsUnsortedNotice(false);
      return;
    }
    const numbers = arrayStr
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    let unsorted = false;
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i] > numbers[i + 1]) {
        unsorted = true;
        break;
      }
    }
    setIsUnsortedNotice(unsorted);
  }, [arrayStr, isBinarySearch]);

  // Helper to parse comma-separated integers
  const parseIntegerList = (str: string, fieldName: string, min = 0, max = 50): number[] | null => {
    const raw = str.split(/[\s,]+/).filter((s) => s.trim().length > 0);
    if (raw.length < min) {
      setValidationError(`Please provide at least ${min} integer element(s) for ${fieldName}.`);
      return null;
    }
    if (raw.length > max) {
      setValidationError(`${fieldName} cannot exceed ${max} elements.`);
      return null;
    }
    const result: number[] = [];
    for (const token of raw) {
      const num = Number(token);
      if (isNaN(num) || !Number.isInteger(num)) {
        setValidationError(`'${token}' is not a valid integer in ${fieldName}.`);
        return null;
      }
      if (num < -10000 || num > 10000) {
        setValidationError(`Value '${num}' is outside allowed bounds (-10000 to 10000).`);
        return null;
      }
      result.push(num);
    }
    return result;
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // SORTING & SEARCHING
    if (isSorting || isSearching) {
      const parsed = parseIntegerList(arrayStr, 'Array Elements', 1, 50);
      if (!parsed) return;

      if (isSearching) {
        if (isNaN(targetVal) || !Number.isInteger(targetVal)) {
          setValidationError('Search target must be a valid integer.');
          return;
        }
        if (targetVal < -10000 || targetVal > 10000) {
          setValidationError('Search target is outside allowed bounds (-10000 to 10000).');
          return;
        }
        onSubmit(parsed, targetVal);
      } else {
        onSubmit(parsed);
      }
      return;
    }

    // DATA STRUCTURES (Stack, Queue, Linked List)
    if (isDataStructure) {
      const parsedElements = parseIntegerList(dsElementsStr, 'Initial Elements', 0, 50);
      if (parsedElements === null) return;

      const payload = {
        elements: parsedElements,
        operations: dsOperations,
      };
      onSubmit(payload);
      return;
    }

    // TREES: Binary Tree
    if (algorithmId === 'binary_tree') {
      const parsedPreorder = parseIntegerList(preorderStr, 'Preorder Sequence', 1, 63);
      if (parsedPreorder === null) return;

      const payload = {
        preorder: parsedPreorder,
      };
      onSubmit(payload);
      return;
    }

    // TREES: BST
    if (algorithmId === 'bst') {
      const parsedValues = parseIntegerList(bstValuesStr, 'BST Values', 1, 30);
      if (parsedValues === null) return;

      const payload: any = { values: parsedValues };
      if (bstSearchTarget.trim()) {
        const num = Number(bstSearchTarget.trim());
        if (isNaN(num) || !Number.isInteger(num)) {
          setValidationError('Search target must be an integer.');
          return;
        }
        payload.search_target = num;
      }
      if (bstDeleteTarget.trim()) {
        const num = Number(bstDeleteTarget.trim());
        if (isNaN(num) || !Number.isInteger(num)) {
          setValidationError('Delete target must be an integer.');
          return;
        }
        payload.delete_target = num;
      }

      onSubmit(payload);
      return;
    }

    // GRAPHS: BFS & DFS
    if (isGraph) {
      const v = Number(graphVertices);
      if (isNaN(v) || !Number.isInteger(v) || v < 1 || v > 30) {
        setValidationError('Vertices must be an integer between 1 and 30.');
        return;
      }

      const s = Number(graphSrc);
      if (isNaN(s) || !Number.isInteger(s) || s < 0 || s >= v) {
        setValidationError(`Source vertex must be between 0 and ${v - 1}.`);
        return;
      }

      // Parse edge string e.g. "0-1, 0-2, 1-3"
      const edgeTokens = graphEdgesStr.split(/[\s,]+/).filter((t) => t.trim().length > 0);
      const parsedEdges: Array<[number, number]> = [];

      for (const token of edgeTokens) {
        const parts = token.split(/[-:]/);
        if (parts.length !== 2) {
          setValidationError(`Invalid edge format '${token}'. Use format 'u-v' (e.g. 0-1).`);
          return;
        }
        const u = Number(parts[0].trim());
        const w = Number(parts[1].trim());
        if (isNaN(u) || !Number.isInteger(u) || isNaN(w) || !Number.isInteger(w)) {
          setValidationError(`Edge endpoints in '${token}' must be integers.`);
          return;
        }
        if (u < 0 || u >= v || w < 0 || w >= v) {
          setValidationError(`Edge [${u}, ${w}] contains endpoint outside bounds [0, ${v - 1}].`);
          return;
        }
        parsedEdges.push([u, w]);
      }

      if (parsedEdges.length > 100) {
        setValidationError('Edges cannot exceed 100.');
        return;
      }

      const payload = {
        vertices: v,
        edges: parsedEdges,
        src: s,
      };
      onSubmit(payload);
      return;
    }
  };

  return (
    <div className="card input-form-card" style={{ padding: '1.25rem' }}>
      <form onSubmit={handleSubmit} noValidate>
        {/* ================================================================ */}
        {/* 1. SORTING & SEARCHING FORM                                     */}
        {/* ================================================================ */}
        {(isSorting || isSearching) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Presets Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Presets:
              </span>
              {(isSorting ? PRESETS.sorting : PRESETS.searching).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setArrayStr(p.array.join(', '));
                    if ('target' in p && typeof p.target === 'number') {
                      setTargetVal(p.target);
                    }
                    setValidationError(null);
                  }}
                  disabled={isLoading}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isSearching ? '1fr 140px' : '1fr', gap: '1rem' }}>
              <div>
                <label
                  htmlFor="input-array"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Array Elements (comma-separated, 1–50 integers)
                </label>
                <input
                  id="input-array"
                  type="text"
                  className="input-field"
                  value={arrayStr}
                  onChange={(e) => setArrayStr(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g. 10, 20, 30, 40, 50"
                  aria-label="Array Elements"
                />
              </div>

              {isSearching && (
                <div>
                  <label
                    htmlFor="input-target"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                  >
                    Target
                  </label>
                  <input
                    id="input-target"
                    type="number"
                    className="input-field"
                    value={targetVal}
                    onChange={(e) => setTargetVal(Number(e.target.value))}
                    disabled={isLoading}
                    aria-label="Search Target"
                  />
                </div>
              )}
            </div>

            {isUnsortedNotice && (
              <div
                style={{
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-secondary)',
                  borderLeft: '3px solid var(--accent-color, #10b981)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                }}
              >
                <strong>Educational note:</strong> Binary search runs on the engine's sorted copy of the input.
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 2. DATA STRUCTURES FORM (Stack, Queue, Linked List)              */}
        {/* ================================================================ */}
        {isDataStructure && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Presets Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Presets:
              </span>
              {(PRESETS[algorithmId as keyof typeof PRESETS] as any[] | undefined)?.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setDsElementsStr((p.elements || []).join(', '));
                    setDsOperations(p.operations || []);
                    setValidationError(null);
                  }}
                  disabled={isLoading}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="input-ds-elements"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
              >
                Initial Elements (comma-separated, max 50)
              </label>
              <input
                id="input-ds-elements"
                type="text"
                className="input-field"
                value={dsElementsStr}
                onChange={(e) => setDsElementsStr(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. 10, 20"
                aria-label="Initial Elements"
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Operations queued:{' '}
              <code>
                {dsOperations.map((o) => `${o.op}${o.val !== undefined ? `(${o.val})` : ''}`).join(' &rarr; ') ||
                  'None (initial elements only)'}
              </code>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 3. BINARY TREE FORM                                              */}
        {/* ================================================================ */}
        {algorithmId === 'binary_tree' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Presets:
              </span>
              {PRESETS.binary_tree.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setPreorderStr(p.preorder.join(', '));
                    setValidationError(null);
                  }}
                  disabled={isLoading}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="input-preorder"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
              >
                Preorder Sequence (-1 denotes null child, max 63 tokens)
              </label>
              <input
                id="input-preorder"
                type="text"
                className="input-field"
                value={preorderStr}
                onChange={(e) => setPreorderStr(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. 1, 2, -1, -1, 3, -1, -1"
                aria-label="Preorder Sequence"
              />
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 4. BST FORM                                                      */}
        {/* ================================================================ */}
        {algorithmId === 'bst' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Presets:
              </span>
              {PRESETS.bst.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setBstValuesStr(p.values.join(', '));
                    setBstSearchTarget(p.search_target !== undefined ? String(p.search_target) : '');
                    setBstDeleteTarget(p.delete_target !== undefined ? String(p.delete_target) : '');
                    setValidationError(null);
                  }}
                  disabled={isLoading}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="input-bst-values"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Values (comma-separated, max 30)
                </label>
                <input
                  id="input-bst-values"
                  type="text"
                  className="input-field"
                  value={bstValuesStr}
                  onChange={(e) => setBstValuesStr(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g. 50, 30, 70"
                  aria-label="BST Values"
                />
              </div>

              <div>
                <label
                  htmlFor="input-bst-search"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Search Target
                </label>
                <input
                  id="input-bst-search"
                  type="number"
                  className="input-field"
                  value={bstSearchTarget}
                  onChange={(e) => setBstSearchTarget(e.target.value)}
                  disabled={isLoading}
                  placeholder="Optional"
                  aria-label="BST Search Target"
                />
              </div>

              <div>
                <label
                  htmlFor="input-bst-delete"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Delete Target
                </label>
                <input
                  id="input-bst-delete"
                  type="number"
                  className="input-field"
                  value={bstDeleteTarget}
                  onChange={(e) => setBstDeleteTarget(e.target.value)}
                  disabled={isLoading}
                  placeholder="Optional"
                  aria-label="BST Delete Target"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 5. GRAPHS FORM (BFS & DFS)                                       */}
        {/* ================================================================ */}
        {isGraph && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Presets:
              </span>
              {PRESETS.graphs.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setGraphVertices(p.vertices);
                    setGraphEdgesStr(p.edges);
                    setGraphSrc(p.src);
                    setValidationError(null);
                  }}
                  disabled={isLoading}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="input-graph-v"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Vertices (1–30)
                </label>
                <input
                  id="input-graph-v"
                  type="number"
                  min="1"
                  max="30"
                  className="input-field"
                  value={graphVertices}
                  onChange={(e) => setGraphVertices(Number(e.target.value))}
                  disabled={isLoading}
                  aria-label="Graph Vertices"
                />
              </div>

              <div>
                <label
                  htmlFor="input-graph-src"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Source Vertex
                </label>
                <input
                  id="input-graph-src"
                  type="number"
                  min="0"
                  max={Math.max(0, graphVertices - 1)}
                  className="input-field"
                  value={graphSrc}
                  onChange={(e) => setGraphSrc(Number(e.target.value))}
                  disabled={isLoading}
                  aria-label="Source Vertex"
                />
              </div>

              <div>
                <label
                  htmlFor="input-graph-edges"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}
                >
                  Edges (comma-separated u-v, max 100)
                </label>
                <input
                  id="input-graph-edges"
                  type="text"
                  className="input-field"
                  value={graphEdgesStr}
                  onChange={(e) => setGraphEdgesStr(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g. 0-1, 0-2, 1-3, 2-4"
                  aria-label="Graph Edges"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="error-banner" role="alert" style={{ marginTop: '0.75rem' }}>
            <div className="error-message">{validationError}</div>
          </div>
        )}

        {/* Submit Button */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                Executing Engine...
              </>
            ) : (
              'Run Visualization'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
