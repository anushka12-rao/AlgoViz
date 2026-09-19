#pragma once
#include <vector>
#include <string>
#include <map>

// Generic Tree Node Record representing a snapshot of a node with structural pointer IDs
struct TreeNodeRecord {
    int id;
    int val;
    int left_id;  // -1 if NULL
    int right_id; // -1 if NULL

    TreeNodeRecord() : id(-1), val(0), left_id(-1), right_id(-1) {}
    TreeNodeRecord(int i, int v, int l = -1, int r = -1) : id(i), val(v), left_id(l), right_id(r) {}
};

// Generic step event payload capturing algorithm state transitions
struct StepEvent {
    int step_index;
    std::string action;
    std::string message;
    int canonical_duration_ms;
    std::vector<int> active_indices;
    std::vector<int> array_state;
    std::vector<TreeNodeRecord> tree_state;
    std::vector<std::vector<int>> graph_adj;
    std::vector<int> graph_traversal;
    std::vector<int> graph_queue;
    std::vector<bool> graph_visited;
    int current_vertex;
    int sorted_boundary;
    int range_st;
    int range_end;
    int range_mid;
    int pivot_idx;
    int pivot_val;
    std::map<std::string, int> stats;

    StepEvent() : step_index(0), canonical_duration_ms(0), current_vertex(-1), sorted_boundary(-1),
                  range_st(-1), range_end(-1), range_mid(-1), pivot_idx(-1), pivot_val(0) {}
};

// Abstract Observer Interface: Decouples algorithm core from presentation
class IAlgoObserver {
public:
    virtual ~IAlgoObserver() {}

    virtual bool isAutoMode() const = 0;
    virtual void onPause(int ms) = 0;

    // Common lifecycle hooks
    virtual void onInitial(const std::vector<int> &arr) {}
    virtual void onPassStart(int passNum, const std::vector<int> &arr) {}
    virtual void onEarlyExit(const std::vector<int> &arr, int passNum, int comparisons, int swaps) {}

    // Bubble sort specific hooks
    virtual void onBubbleCompare(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) {}
    virtual void onBubbleSwap(const std::vector<int> &arr, int pos1, int pos2, int valA, int valB, int comparisons, int swaps, int passes) {}
    virtual void onBubbleNoSwap(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) {}
    virtual void onBubblePassEnd(const std::vector<int> &arr, int passNum, int sortedFrom, int comparisons, int swaps) {}
    virtual void onBubbleComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) {}

    // Selection sort specific hooks
    virtual void onSelectionBoundary(const std::vector<int> &arr, int boundaryIdx, int val) {}
    virtual void onSelectionCompare(const std::vector<int> &arr, int minIdx, int scanIdx, int minVal, int targetVal, int comparisons) {}
    virtual void onSelectionNewMin(const std::vector<int> &arr, int newMinIdx, int val) {}
    virtual void onSelectionPreSwap(const std::vector<int> &arr, int idxI, int minIdx, int valI, int minVal) {}
    virtual void onSelectionNoSwap(const std::vector<int> &arr, int idxI, int valI) {}
    virtual void onSelectionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int swaps) {}
    virtual void onSelectionComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) {}

    // Insertion sort specific hooks
    virtual void onInsertionKeyExtracted(const std::vector<int> &arr, int keyIdx, int keyVal) {}
    virtual void onInsertionCompare(const std::vector<int> &arr, int pos1, int pos2, int keyVal, int compVal, int comparisons) {}
    virtual void onInsertionShift(const std::vector<int> &arr, int fromIdx, int toIdx, int shiftedVal, int keyVal, int shifts) {}
    virtual void onInsertionFoundPosition(const std::vector<int> &arr, int pos, int keyVal, int compVal) {}
    virtual void onInsertionPlacedKey(const std::vector<int> &arr, int placedIdx, int keyVal) {}
    virtual void onInsertionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int shifts) {}
    virtual void onInsertionComplete(const std::vector<int> &arr, int comparisons, int shifts, int passes) {}

    // Merge sort specific hooks
    virtual void onMergeSplit(const std::vector<int> &arr, int st, int mid, int end) {}
    virtual void onMergeStart(const std::vector<int> &arr, int st, int mid, int end) {}
    virtual void onMergeCompare(const std::vector<int> &arr, int leftIdx, int rightIdx, int leftVal, int rightVal, bool leftChosen, int comparisons) {}
    virtual void onMergeCopyRemaining(const std::vector<int> &arr, int idx, int val, bool isLeft) {}
    virtual void onMergeSectionEnd(const std::vector<int> &arr, int st, int end, int mergesCount) {}
    virtual void onMergeComplete(const std::vector<int> &arr, int comparisons, int mergesCount) {}

    // Quick sort specific hooks
    virtual void onQuickPartitionStart(const std::vector<int> &arr, int st, int end, int pivotVal, int pivotIdx) {}
    virtual void onQuickComparePivot(const std::vector<int> &arr, int j, int pivotIdx, int jVal, int pivotVal, int comparisons) {}
    virtual void onQuickSwap(const std::vector<int> &arr, int idx, int j, int valIdxOriginal, int valJOriginal, int pivotVal, int comparisons, int swaps) {}
    virtual void onQuickSameIndex(const std::vector<int> &arr, int idx, int valIdx, int pivotVal) {}
    virtual void onQuickGreater(const std::vector<int> &arr, int j, int pivotIdx, int valJ, int pivotVal) {}
    virtual void onQuickPivotPlaced(const std::vector<int> &arr, int pivotIdx, int oldEndIdx, int pivotVal, int st, int end, int swaps) {}
    virtual void onQuickSubparts(const std::vector<int> &arr, int pivIdx, int st, int end) {}
    virtual void onQuickComplete(const std::vector<int> &arr, int comparisons, int swaps) {}

    // Linear search specific hooks
    virtual void onLinearSearchStart(const std::vector<int> &arr, int target) {}
    virtual void onLinearSearchCheck(const std::vector<int> &arr, int currentIndex, int target, int comparisons) {}
    virtual void onLinearSearchMatch(const std::vector<int> &arr, int index, int target) {}
    virtual void onLinearSearchMismatch(const std::vector<int> &arr, int index, int currentVal, int target) {}
    virtual void onLinearSearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) {}

    // Binary search specific hooks
    virtual void onBinarySearchStart(const std::vector<int> &arr, int target) {}
    virtual void onBinarySearchStep(const std::vector<int> &arr, int st, int mid, int end, int target, int comparisons) {}
    virtual void onBinarySearchGreater(const std::vector<int> &arr, int mid, int target, int midVal) {}
    virtual void onBinarySearchSmaller(const std::vector<int> &arr, int mid, int target, int midVal) {}
    virtual void onBinarySearchMatch(const std::vector<int> &arr, int mid, int target, int midVal) {}
    virtual void onBinarySearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) {}

    // Stack specific hooks
    virtual void onStackInit(const std::vector<int> &elements) {}
    virtual void onStackPush(const std::vector<int> &elements, int val, int highlightIdx) {}
    virtual void onStackOverflow(const std::vector<int> &elements) {}
    virtual void onStackPop(const std::vector<int> &elements, int poppedVal) {}
    virtual void onStackUnderflow(const std::vector<int> &elements) {}
    virtual void onStackTop(const std::vector<int> &elements, int topVal, int highlightIdx, bool empty) {}
    virtual void onStackEmptyCheck(const std::vector<int> &elements, bool isEmpty) {}
    virtual void onStackClear(const std::vector<int> &elements) {}

    // Queue specific hooks
    virtual void onQueueInit(const std::vector<int> &elements) {}
    virtual void onQueuePush(const std::vector<int> &elements, int val) {}
    virtual void onQueuePop(const std::vector<int> &elements, int removedVal) {}
    virtual void onQueueUnderflow(const std::vector<int> &elements) {}
    virtual void onQueueFront(const std::vector<int> &elements, int frontVal, bool empty) {}
    virtual void onQueueEmptyCheck(const std::vector<int> &elements, bool isEmpty) {}
    virtual void onQueueClear(const std::vector<int> &elements) {}

    // Linked list specific hooks
    virtual void onListInit(const std::vector<int> &elements) {}
    virtual void onListPushFront(const std::vector<int> &elements, int val, int highlightIdx) {}
    virtual void onListPushBack(const std::vector<int> &elements, int val, int highlightIdx) {}
    virtual void onListPopFront(const std::vector<int> &elements, int removedVal) {}
    virtual void onListPopBack(const std::vector<int> &elements, int removedVal) {}
    virtual void onListUnderflow(const std::vector<int> &elements, const std::string &op) {}
    virtual void onListSearch(const std::vector<int> &elements, int key, int foundIdx, bool wasEmpty) {}
    virtual void onListClear(const std::vector<int> &elements) {}

    // Binary Tree specific hooks
    virtual void onBinaryTreeInit(const std::vector<TreeNodeRecord> & /*tree*/, const std::string & /*msg*/) {}
    virtual void onBinaryTreeInsert(const std::vector<TreeNodeRecord> & /*tree*/, int /*parentVal*/, int /*newVal*/, char /*side*/, bool /*success*/, const std::string & /*msg*/) {}
    virtual void onBinaryTreeBuildPreorder(const std::vector<TreeNodeRecord> & /*tree*/, const std::vector<int> & /*preorder*/, bool /*success*/, const std::string & /*msg*/) {}
    virtual void onBinaryTreeTraversal(const std::vector<TreeNodeRecord> & /*tree*/, const std::string & /*traversalType*/, const std::vector<int> & /*result*/, bool /*empty*/) {}
    virtual void onBinaryTreeLevelOrder(const std::vector<TreeNodeRecord> & /*tree*/, const std::vector<std::vector<int>> & /*levels*/, bool /*empty*/) {}
    virtual void onBinaryTreeMetrics(const std::vector<TreeNodeRecord> & /*tree*/, int /*count*/, int /*height*/, int /*sum*/, bool /*empty*/) {}
    virtual void onBinaryTreeClear(const std::vector<TreeNodeRecord> & /*tree*/, const std::string & /*msg*/) {}

    // BST specific hooks
    virtual void onBSTInit(const std::vector<TreeNodeRecord> & /*tree*/, const std::string & /*msg*/) {}
    virtual void onBSTInsertBatch(const std::vector<TreeNodeRecord> & /*tree*/, const std::vector<int> & /*inputValues*/, int /*addedCount*/, int /*duplicateCount*/, const std::vector<int> & /*sortedValues*/, const std::string & /*msg*/) {}
    virtual void onBSTSearch(const std::vector<TreeNodeRecord> & /*tree*/, int /*target*/, bool /*found*/, const std::vector<std::string> & /*path*/, const std::vector<int> & /*sortedValues*/, const std::string & /*msg*/) {}
    virtual void onBSTDelete(const std::vector<TreeNodeRecord> & /*tree*/, int /*val*/, bool /*deleted*/, const std::vector<int> & /*sortedValues*/, const std::string & /*msg*/) {}
    virtual void onBSTSorted(const std::vector<TreeNodeRecord> & /*tree*/, const std::vector<int> & /*sortedValues*/, bool /*empty*/) {}
    virtual void onBSTClear(const std::vector<TreeNodeRecord> & /*tree*/, const std::string & /*msg*/) {}

    // Graph specific hooks
    virtual void onGraphInit(int /*vertices*/) {}
    virtual void onGraphAddEdge(int /*u*/, int /*v*/, bool /*success*/) {}
    virtual void onGraphPrint(int /*vertices*/, const std::vector<std::vector<int>> & /*adjList*/) {}

    // BFS hooks
    virtual void onBFSTraversalStart(int /*vertices*/, int /*src*/, const std::vector<std::vector<int>> & /*adjList*/) {}
    virtual void onBFSVertexDequeued(int /*u*/, const std::vector<int> & /*currentQueue*/, const std::vector<bool> & /*visited*/) {}
    virtual void onBFSNeighborInspect(int /*u*/, int /*v*/, bool /*alreadyVisited*/) {}
    virtual void onBFSVertexEnqueued(int /*v*/, const std::vector<int> & /*currentQueue*/, const std::vector<bool> & /*visited*/) {}
    virtual void onBFSComponentTransition(int /*nextComponentRoot*/) {}
    virtual void onBFSTraversalComplete(int /*vertices*/, int /*src*/, const std::vector<int> & /*traversalOrder*/, const std::vector<std::vector<int>> & /*adjList*/) {}

    // DFS hooks
    virtual void onDFSTraversalStart(int /*vertices*/, int /*src*/, const std::vector<std::vector<int>> & /*adjList*/) {}
    virtual void onDFSVertexEnter(int /*u*/, const std::vector<int> & /*callStack*/, const std::vector<bool> & /*visited*/) {}
    virtual void onDFSNeighborInspect(int /*u*/, int /*v*/, bool /*alreadyVisited*/) {}
    virtual void onDFSVertexBacktrack(int /*u*/, const std::vector<int> & /*callStack*/) {}
    virtual void onDFSComponentTransition(int /*nextComponentRoot*/) {}
    virtual void onDFSTraversalComplete(int /*vertices*/, int /*src*/, const std::vector<int> & /*traversalOrder*/, const std::vector<std::vector<int>> & /*adjList*/) {}
};

// ConsoleObserver: Renders existing terminal output and handles Sleep / waitForEnter
class ConsoleObserver : public IAlgoObserver {
private:
    bool autoMode;

public:
    ConsoleObserver(bool autoMode);
    virtual ~ConsoleObserver() {}

    bool isAutoMode() const override;
    void onPause(int ms) override;

    void onInitial(const std::vector<int> &arr) override;
    void onPassStart(int passNum, const std::vector<int> &arr) override;
    void onEarlyExit(const std::vector<int> &arr, int passNum, int comparisons, int swaps) override;

    // Bubble sort
    void onBubbleCompare(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) override;
    void onBubbleSwap(const std::vector<int> &arr, int pos1, int pos2, int valA, int valB, int comparisons, int swaps, int passes) override;
    void onBubbleNoSwap(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) override;
    void onBubblePassEnd(const std::vector<int> &arr, int passNum, int sortedFrom, int comparisons, int swaps) override;
    void onBubbleComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) override;

    // Selection sort
    void onSelectionBoundary(const std::vector<int> &arr, int boundaryIdx, int val) override;
    void onSelectionCompare(const std::vector<int> &arr, int minIdx, int scanIdx, int minVal, int targetVal, int comparisons) override;
    void onSelectionNewMin(const std::vector<int> &arr, int newMinIdx, int val) override;
    void onSelectionPreSwap(const std::vector<int> &arr, int idxI, int minIdx, int valI, int minVal) override;
    void onSelectionNoSwap(const std::vector<int> &arr, int idxI, int valI) override;
    void onSelectionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int swaps) override;
    void onSelectionComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) override;

    // Insertion sort
    void onInsertionKeyExtracted(const std::vector<int> &arr, int keyIdx, int keyVal) override;
    void onInsertionCompare(const std::vector<int> &arr, int pos1, int pos2, int keyVal, int compVal, int comparisons) override;
    void onInsertionShift(const std::vector<int> &arr, int fromIdx, int toIdx, int shiftedVal, int keyVal, int shifts) override;
    void onInsertionFoundPosition(const std::vector<int> &arr, int pos, int keyVal, int compVal) override;
    void onInsertionPlacedKey(const std::vector<int> &arr, int placedIdx, int keyVal) override;
    void onInsertionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int shifts) override;
    void onInsertionComplete(const std::vector<int> &arr, int comparisons, int shifts, int passes) override;

    // Merge sort
    void onMergeSplit(const std::vector<int> &arr, int st, int mid, int end) override;
    void onMergeStart(const std::vector<int> &arr, int st, int mid, int end) override;
    void onMergeCompare(const std::vector<int> &arr, int leftIdx, int rightIdx, int leftVal, int rightVal, bool leftChosen, int comparisons) override;
    void onMergeCopyRemaining(const std::vector<int> &arr, int idx, int val, bool isLeft) override;
    void onMergeSectionEnd(const std::vector<int> &arr, int st, int end, int mergesCount) override;
    void onMergeComplete(const std::vector<int> &arr, int comparisons, int mergesCount) override;

    // Quick sort
    void onQuickPartitionStart(const std::vector<int> &arr, int st, int end, int pivotVal, int pivotIdx) override;
    void onQuickComparePivot(const std::vector<int> &arr, int j, int pivotIdx, int jVal, int pivotVal, int comparisons) override;
    void onQuickSwap(const std::vector<int> &arr, int idx, int j, int valIdxOriginal, int valJOriginal, int pivotVal, int comparisons, int swaps) override;
    void onQuickSameIndex(const std::vector<int> &arr, int idx, int valIdx, int pivotVal) override;
    void onQuickGreater(const std::vector<int> &arr, int j, int pivotIdx, int valJ, int pivotVal) override;
    void onQuickPivotPlaced(const std::vector<int> &arr, int pivotIdx, int oldEndIdx, int pivotVal, int st, int end, int swaps) override;
    void onQuickSubparts(const std::vector<int> &arr, int pivIdx, int st, int end) override;
    void onQuickComplete(const std::vector<int> &arr, int comparisons, int swaps) override;

    // Linear search
    void onLinearSearchStart(const std::vector<int> &arr, int target) override;
    void onLinearSearchCheck(const std::vector<int> &arr, int currentIndex, int target, int comparisons) override;
    void onLinearSearchMatch(const std::vector<int> &arr, int index, int target) override;
    void onLinearSearchMismatch(const std::vector<int> &arr, int index, int currentVal, int target) override;
    void onLinearSearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) override;

    // Binary search
    void onBinarySearchStart(const std::vector<int> &arr, int target) override;
    void onBinarySearchStep(const std::vector<int> &arr, int st, int mid, int end, int target, int comparisons) override;
    void onBinarySearchGreater(const std::vector<int> &arr, int mid, int target, int midVal) override;
    void onBinarySearchSmaller(const std::vector<int> &arr, int mid, int target, int midVal) override;
    void onBinarySearchMatch(const std::vector<int> &arr, int mid, int target, int midVal) override;
    void onBinarySearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) override;

    // Stack hooks
    void onStackInit(const std::vector<int> &elements) override;
    void onStackPush(const std::vector<int> &elements, int val, int highlightIdx) override;
    void onStackOverflow(const std::vector<int> &elements) override;
    void onStackPop(const std::vector<int> &elements, int poppedVal) override;
    void onStackUnderflow(const std::vector<int> &elements) override;
    void onStackTop(const std::vector<int> &elements, int topVal, int highlightIdx, bool empty) override;
    void onStackEmptyCheck(const std::vector<int> &elements, bool isEmpty) override;
    void onStackClear(const std::vector<int> &elements) override;

    // Queue hooks
    void onQueueInit(const std::vector<int> &elements) override;
    void onQueuePush(const std::vector<int> &elements, int val) override;
    void onQueuePop(const std::vector<int> &elements, int removedVal) override;
    void onQueueUnderflow(const std::vector<int> &elements) override;
    void onQueueFront(const std::vector<int> &elements, int frontVal, bool empty) override;
    void onQueueEmptyCheck(const std::vector<int> &elements, bool isEmpty) override;
    void onQueueClear(const std::vector<int> &elements) override;

    // Linked list hooks
    void onListInit(const std::vector<int> &elements) override;
    void onListPushFront(const std::vector<int> &elements, int val, int highlightIdx) override;
    void onListPushBack(const std::vector<int> &elements, int val, int highlightIdx) override;
    void onListPopFront(const std::vector<int> &elements, int removedVal) override;
    void onListPopBack(const std::vector<int> &elements, int removedVal) override;
    void onListUnderflow(const std::vector<int> &elements, const std::string &op) override;
    void onListSearch(const std::vector<int> &elements, int key, int foundIdx, bool wasEmpty) override;
    void onListClear(const std::vector<int> &elements) override;

    // Binary Tree hooks
    void onBinaryTreeInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;
    void onBinaryTreeInsert(const std::vector<TreeNodeRecord> &tree, int parentVal, int newVal, char side, bool success, const std::string &msg) override;
    void onBinaryTreeBuildPreorder(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &preorder, bool success, const std::string &msg) override;
    void onBinaryTreeTraversal(const std::vector<TreeNodeRecord> &tree, const std::string &traversalType, const std::vector<int> &result, bool empty) override;
    void onBinaryTreeLevelOrder(const std::vector<TreeNodeRecord> &tree, const std::vector<std::vector<int>> &levels, bool empty) override;
    void onBinaryTreeMetrics(const std::vector<TreeNodeRecord> &tree, int count, int height, int sum, bool empty) override;
    void onBinaryTreeClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;

    // BST hooks
    void onBSTInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;
    void onBSTInsertBatch(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &inputValues, int addedCount, int duplicateCount, const std::vector<int> &sortedValues, const std::string &msg) override;
    void onBSTSearch(const std::vector<TreeNodeRecord> &tree, int target, bool found, const std::vector<std::string> &path, const std::vector<int> &sortedValues, const std::string &msg) override;
    void onBSTDelete(const std::vector<TreeNodeRecord> &tree, int val, bool deleted, const std::vector<int> &sortedValues, const std::string &msg) override;
    void onBSTSorted(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &sortedValues, bool empty) override;
    void onBSTClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;

    // Graph hooks
    void onGraphPrint(int vertices, const std::vector<std::vector<int>> &adjList) override;
    void onBFSTraversalComplete(int vertices, int src, const std::vector<int> &traversalOrder, const std::vector<std::vector<int>> &adjList) override;
    void onDFSTraversalComplete(int vertices, int src, const std::vector<int> &traversalOrder, const std::vector<std::vector<int>> &adjList) override;

    // Terminal renderers
    void renderStack(const std::vector<int> &v, int highlightIndex = -1, const std::string &statusMsg = "") const;
    void renderQueue(const std::vector<int> &v, const std::string &statusMsg = "") const;
    void renderList(const std::vector<int> &v, int highlightIdx = -1, const std::string &statusMsg = "") const;
    void renderTreeBranches(const std::vector<TreeNodeRecord> &tree, int nodeIdx, const std::string &prefix, bool isLeft) const;
    void renderBinaryTree(const std::vector<TreeNodeRecord> &tree, const std::string &statusMsg = "") const;
    void renderBST(const std::vector<TreeNodeRecord> &tree, const std::string &statusMsg = "") const;
};
