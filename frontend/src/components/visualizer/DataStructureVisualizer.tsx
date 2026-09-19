import React from 'react';
import { EngineEvent } from '../../types/engine';

export interface DataStructureVisualizerProps {
  currentEvent: EngineEvent | null;
  algorithmId: string;
}

export const DataStructureVisualizer: React.FC<DataStructureVisualizerProps> = ({
  currentEvent,
  algorithmId,
}) => {
  const elements = currentEvent?.array_state ?? [];
  const activeIndices = new Set(currentEvent?.active_indices ?? []);
  const action = currentEvent?.action ?? '';
  const pivotVal = currentEvent?.pivot_val;
  const pivotIdx = currentEvent?.pivot_idx ?? -1;
  const isOverflow = action === 'OVERFLOW';
  const isUnderflow = action === 'UNDERFLOW';

  // --------------------------------------------------------------------------
  // STACK RENDERER (LIFO - Bottom to Top)
  // --------------------------------------------------------------------------
  if (algorithmId === 'stack') {
    const MAX_CAPACITY = 7;
    const topIndex = elements.length - 1;

    return (
      <div
        className="ds-visualizer-container stack-container"
        data-testid="stack-visualizer"
        aria-label="Stack Visualization"
      >
        <div className="ds-header">
          <span className="ds-title">Stack (LIFO)</span>
          <span className="ds-capacity-badge">
            Size: {elements.length} / {MAX_CAPACITY}
          </span>
        </div>

        {isOverflow && (
          <div className="ds-alert ds-alert-error" role="alert" data-testid="stack-overflow-alert">
            <strong>Stack Overflow!</strong> Maximum capacity ({MAX_CAPACITY}) reached. Push operation rejected.
          </div>
        )}

        {isUnderflow && (
          <div className="ds-alert ds-alert-warning" role="alert" data-testid="stack-underflow-alert">
            <strong>Stack Underflow!</strong> Cannot pop or inspect an empty stack.
          </div>
        )}

        {action === 'POP' && pivotVal !== undefined && (
          <div className="ds-action-badge" data-testid="stack-popped-badge">
            Popped Value: <strong>{pivotVal}</strong>
          </div>
        )}

        <div className="stack-bucket" data-testid="stack-bucket">
          {/* Render 7 slots from top down, slot 6 down to 0 */}
          {Array.from({ length: MAX_CAPACITY }).map((_, slotIdx) => {
            const actualIdx = MAX_CAPACITY - 1 - slotIdx;
            const hasElement = actualIdx < elements.length;
            const val = hasElement ? elements[actualIdx] : null;
            const isTop = hasElement && actualIdx === topIndex;
            const isActive = hasElement && activeIndices.has(actualIdx);

            return (
              <div
                key={actualIdx}
                className={`stack-slot ${hasElement ? 'filled' : 'empty'} ${
                  isTop ? 'top-slot' : ''
                } ${isActive ? 'active-slot' : ''}`}
                data-testid={`stack-slot-${actualIdx}`}
              >
                <span className="slot-index">[{actualIdx}]</span>
                {hasElement ? (
                  <span className="slot-value" data-testid={`stack-val-${actualIdx}`}>
                    {val}
                  </span>
                ) : (
                  <span className="slot-empty-label">empty</span>
                )}
                {isTop && (
                  <span className="top-indicator" data-testid="stack-top-indicator">
                    &larr; TOP
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {elements.length === 0 && !isUnderflow && (
          <div className="ds-empty-note" data-testid="stack-empty-note">
            Stack is currently empty
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // QUEUE RENDERER (FIFO - Front to Rear)
  // --------------------------------------------------------------------------
  if (algorithmId === 'queue') {
    const rearIndex = elements.length - 1;

    return (
      <div
        className="ds-visualizer-container queue-container"
        data-testid="queue-visualizer"
        aria-label="Queue Visualization"
      >
        <div className="ds-header">
          <span className="ds-title">Queue (FIFO Pipeline)</span>
          <span className="ds-capacity-badge">Count: {elements.length}</span>
        </div>

        {isUnderflow && (
          <div className="ds-alert ds-alert-warning" role="alert" data-testid="queue-underflow-alert">
            <strong>Queue Underflow!</strong> Cannot dequeue or peek front of an empty queue.
          </div>
        )}

        {action === 'POP' && pivotVal !== undefined && (
          <div className="ds-action-badge" data-testid="queue-dequeued-badge">
            Dequeued Value: <strong>{pivotVal}</strong>
          </div>
        )}

        <div className="queue-pipeline-wrapper">
          <div className="queue-marker front-marker" data-testid="queue-front-marker">
            <span>&larr; FRONT</span>
            <small>(Dequeue)</small>
          </div>

          <div className="queue-pipeline" data-testid="queue-pipeline">
            {elements.length === 0 ? (
              <div className="ds-empty-pipeline" data-testid="queue-empty-note">
                Queue is empty
              </div>
            ) : (
              elements.map((val, idx) => {
                const isFront = idx === 0;
                const isRear = idx === rearIndex;
                const isActive = activeIndices.has(idx);

                return (
                  <div
                    key={idx}
                    className={`queue-cell ${isFront ? 'cell-front' : ''} ${
                      isRear ? 'cell-rear' : ''
                    } ${isActive ? 'cell-active' : ''}`}
                    data-testid={`queue-cell-${idx}`}
                  >
                    <span className="cell-pos">#{idx}</span>
                    <span className="cell-val" data-testid={`queue-val-${idx}`}>
                      {val}
                    </span>
                    {isFront && <span className="cell-tag tag-front">FRONT</span>}
                    {isRear && !isFront && <span className="cell-tag tag-rear">REAR</span>}
                  </div>
                );
              })
            )}
          </div>

          <div className="queue-marker rear-marker" data-testid="queue-rear-marker">
            <span>REAR &larr;</span>
            <small>(Enqueue)</small>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LINKED LIST RENDERER (Head to Tail Node Chain)
  // --------------------------------------------------------------------------
  if (algorithmId === 'linked_list') {
    const tailIndex = elements.length - 1;

    return (
      <div
        className="ds-visualizer-container list-container"
        data-testid="linked-list-visualizer"
        aria-label="Singly Linked List Visualization"
      >
        <div className="ds-header">
          <span className="ds-title">Singly Linked List</span>
          <span className="ds-capacity-badge">Length: {elements.length}</span>
        </div>

        {isUnderflow && (
          <div className="ds-alert ds-alert-warning" role="alert" data-testid="list-underflow-alert">
            <strong>List Underflow!</strong> Cannot delete from an empty linked list.
          </div>
        )}

        {(action === 'POP_FRONT' || action === 'POP_BACK') && pivotVal !== undefined && (
          <div className="ds-action-badge" data-testid="list-deleted-badge">
            Deleted Node Value: <strong>{pivotVal}</strong>
          </div>
        )}

        {action === 'SEARCH' && (
          <div
            className={`ds-action-badge ${pivotIdx !== -1 ? 'ds-badge-success' : 'ds-badge-neutral'}`}
            data-testid="list-search-badge"
          >
            Search for <strong>{pivotVal}</strong>:{' '}
            {pivotIdx !== -1 ? `Found at index ${pivotIdx}` : 'Not found in list'}
          </div>
        )}

        <div className="list-chain-scroll">
          <div className="list-chain" data-testid="list-chain">
            {elements.length === 0 ? (
              <div className="ds-empty-note" data-testid="list-empty-note">
                Linked list is empty (HEAD &rarr; NULL)
              </div>
            ) : (
              elements.map((val, idx) => {
                const isHead = idx === 0;
                const isTail = idx === tailIndex;
                const isSearchMatch = action === 'SEARCH' && idx === pivotIdx;
                const isActive = activeIndices.has(idx) || isSearchMatch;

                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`list-node-card ${isActive ? 'node-active' : ''} ${
                        isSearchMatch ? 'node-match' : ''
                      }`}
                      data-testid={`list-node-${idx}`}
                    >
                      {isHead && <span className="node-head-badge" data-testid="list-head-badge">HEAD</span>}
                      {isTail && <span className="node-tail-badge" data-testid="list-tail-badge">TAIL</span>}
                      <div className="node-box">
                        <div className="node-data" data-testid={`list-val-${idx}`}>
                          {val}
                        </div>
                        <div className="node-pointer" title="Next Pointer">
                          &bull;
                        </div>
                      </div>
                      <span className="node-index">idx {idx}</span>
                    </div>

                    <div className="node-arrow" aria-hidden="true" data-testid={`list-arrow-${idx}`}>
                      &rarr;
                    </div>
                  </React.Fragment>
                );
              })
            )}

            <div className="list-null-card" data-testid="list-null-node">
              <code>NULL</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
