#pragma once
#include "../observer.h"
#include <vector>
#include <string>

class JsonObserver : public IAlgoObserver {
private:
    int stepCounter;
    std::vector<StepEvent> events;

public:
    JsonObserver();
    virtual ~JsonObserver();

    bool isAutoMode() const override;
    void onPause(int ms) override;

    // Common lifecycle hooks
    void onInitial(const std::vector<int> &arr) override;
    void onPassStart(int passNum, const std::vector<int> &arr) override;
    void onEarlyExit(const std::vector<int> &arr, int passNum, int comparisons, int swaps) override;

    // Bubble sort specific hooks
    void onBubbleCompare(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) override;
    void onBubbleSwap(const std::vector<int> &arr, int pos1, int pos2, int valA, int valB, int comparisons, int swaps, int passes) override;
    void onBubbleNoSwap(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) override;
    void onBubblePassEnd(const std::vector<int> &arr, int passNum, int sortedFrom, int comparisons, int swaps) override;
    void onBubbleComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) override;

    // Selection sort specific hooks
    void onSelectionBoundary(const std::vector<int> &arr, int boundaryIdx, int val) override;
    void onSelectionCompare(const std::vector<int> &arr, int minIdx, int scanIdx, int minVal, int targetVal, int comparisons) override;
    void onSelectionNewMin(const std::vector<int> &arr, int newMinIdx, int val) override;
    void onSelectionPreSwap(const std::vector<int> &arr, int idxI, int minIdx, int valI, int minVal) override;
    void onSelectionNoSwap(const std::vector<int> &arr, int idxI, int valI) override;
    void onSelectionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int swaps) override;
    void onSelectionComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) override;

    // Insertion sort specific hooks
    void onInsertionKeyExtracted(const std::vector<int> &arr, int keyIdx, int keyVal) override;
    void onInsertionCompare(const std::vector<int> &arr, int pos1, int pos2, int keyVal, int compVal, int comparisons) override;
    void onInsertionShift(const std::vector<int> &arr, int fromIdx, int toIdx, int shiftedVal, int keyVal, int shifts) override;
    void onInsertionFoundPosition(const std::vector<int> &arr, int pos, int keyVal, int compVal) override;
    void onInsertionPlacedKey(const std::vector<int> &arr, int placedIdx, int keyVal) override;
    void onInsertionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int shifts) override;
    void onInsertionComplete(const std::vector<int> &arr, int comparisons, int shifts, int passes) override;

    // Merge sort specific hooks
    void onMergeSplit(const std::vector<int> &arr, int st, int mid, int end) override;
    void onMergeStart(const std::vector<int> &arr, int st, int mid, int end) override;
    void onMergeCompare(const std::vector<int> &arr, int leftIdx, int rightIdx, int leftVal, int rightVal, bool leftChosen, int comparisons) override;
    void onMergeCopyRemaining(const std::vector<int> &arr, int idx, int val, bool isLeft) override;
    void onMergeSectionEnd(const std::vector<int> &arr, int st, int end, int mergesCount) override;
    void onMergeComplete(const std::vector<int> &arr, int comparisons, int mergesCount) override;

    // Quick sort specific hooks
    void onQuickPartitionStart(const std::vector<int> &arr, int st, int end, int pivotVal, int pivotIdx) override;
    void onQuickComparePivot(const std::vector<int> &arr, int j, int pivotIdx, int jVal, int pivotVal, int comparisons) override;
    void onQuickSwap(const std::vector<int> &arr, int idx, int j, int valIdxOriginal, int valJOriginal, int pivotVal, int comparisons, int swaps) override;
    void onQuickSameIndex(const std::vector<int> &arr, int idx, int valIdx, int pivotVal) override;
    void onQuickGreater(const std::vector<int> &arr, int j, int pivotIdx, int valJ, int pivotVal) override;
    void onQuickPivotPlaced(const std::vector<int> &arr, int pivotIdx, int oldEndIdx, int pivotVal, int st, int end, int swaps) override;
    void onQuickSubparts(const std::vector<int> &arr, int pivIdx, int st, int end) override;
    void onQuickComplete(const std::vector<int> &arr, int comparisons, int swaps) override;

    // Linear search specific hooks
    void onLinearSearchStart(const std::vector<int> &arr, int target) override;
    void onLinearSearchCheck(const std::vector<int> &arr, int currentIndex, int target, int comparisons) override;
    void onLinearSearchMatch(const std::vector<int> &arr, int index, int target) override;
    void onLinearSearchMismatch(const std::vector<int> &arr, int index, int currentVal, int target) override;
    void onLinearSearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) override;

    // Binary search specific hooks
    void onBinarySearchStart(const std::vector<int> &arr, int target) override;
    void onBinarySearchStep(const std::vector<int> &arr, int st, int mid, int end, int target, int comparisons) override;
    void onBinarySearchGreater(const std::vector<int> &arr, int mid, int target, int midVal) override;
    void onBinarySearchSmaller(const std::vector<int> &arr, int mid, int target, int midVal) override;
    void onBinarySearchMatch(const std::vector<int> &arr, int mid, int target, int midVal) override;
    void onBinarySearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) override;

    // Stack specific hooks
    void onStackInit(const std::vector<int> &elements) override;
    void onStackPush(const std::vector<int> &elements, int val, int highlightIdx) override;
    void onStackOverflow(const std::vector<int> &elements) override;
    void onStackPop(const std::vector<int> &elements, int poppedVal) override;
    void onStackUnderflow(const std::vector<int> &elements) override;
    void onStackTop(const std::vector<int> &elements, int topVal, int highlightIdx, bool empty) override;
    void onStackEmptyCheck(const std::vector<int> &elements, bool isEmpty) override;
    void onStackClear(const std::vector<int> &elements) override;

    // Queue specific hooks
    void onQueueInit(const std::vector<int> &elements) override;
    void onQueuePush(const std::vector<int> &elements, int val) override;
    void onQueuePop(const std::vector<int> &elements, int removedVal) override;
    void onQueueUnderflow(const std::vector<int> &elements) override;
    void onQueueFront(const std::vector<int> &elements, int frontVal, bool empty) override;
    void onQueueEmptyCheck(const std::vector<int> &elements, bool isEmpty) override;
    void onQueueClear(const std::vector<int> &elements) override;

    // Linked list specific hooks
    void onListInit(const std::vector<int> &elements) override;
    void onListPushFront(const std::vector<int> &elements, int val, int highlightIdx) override;
    void onListPushBack(const std::vector<int> &elements, int val, int highlightIdx) override;
    void onListPopFront(const std::vector<int> &elements, int removedVal) override;
    void onListPopBack(const std::vector<int> &elements, int removedVal) override;
    void onListUnderflow(const std::vector<int> &elements, const std::string &op) override;
    void onListSearch(const std::vector<int> &elements, int key, int foundIdx, bool wasEmpty) override;
    void onListClear(const std::vector<int> &elements) override;

    // Binary Tree specific hooks
    void onBinaryTreeInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;
    void onBinaryTreeInsert(const std::vector<TreeNodeRecord> &tree, int parentVal, int newVal, char side, bool success, const std::string &msg) override;
    void onBinaryTreeBuildPreorder(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &preorder, bool success, const std::string &msg) override;
    void onBinaryTreeTraversal(const std::vector<TreeNodeRecord> &tree, const std::string &traversalType, const std::vector<int> &result, bool empty) override;
    void onBinaryTreeLevelOrder(const std::vector<TreeNodeRecord> &tree, const std::vector<std::vector<int>> &levels, bool empty) override;
    void onBinaryTreeMetrics(const std::vector<TreeNodeRecord> &tree, int count, int height, int sum, bool empty) override;
    void onBinaryTreeClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;

    // BST specific hooks
    void onBSTInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;
    void onBSTInsertBatch(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &inputValues, int addedCount, int duplicateCount, const std::vector<int> &sortedValues, const std::string &msg) override;
    void onBSTSearch(const std::vector<TreeNodeRecord> &tree, int target, bool found, const std::vector<std::string> &path, const std::vector<int> &sortedValues, const std::string &msg) override;
    void onBSTDelete(const std::vector<TreeNodeRecord> &tree, int val, bool deleted, const std::vector<int> &sortedValues, const std::string &msg) override;
    void onBSTSorted(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &sortedValues, bool empty) override;
    void onBSTClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) override;

    // Graph specific hooks
    void onGraphInit(int vertices) override;
    void onGraphAddEdge(int u, int v, bool success) override;
    void onGraphPrint(int vertices, const std::vector<std::vector<int>> &adjList) override;

    // BFS hooks
    void onBFSTraversalStart(int vertices, int src, const std::vector<std::vector<int>> &adjList) override;
    void onBFSVertexDequeued(int u, const std::vector<int> &currentQueue, const std::vector<bool> &visited) override;
    void onBFSNeighborInspect(int u, int v, bool alreadyVisited) override;
    void onBFSVertexEnqueued(int v, const std::vector<int> &currentQueue, const std::vector<bool> &visited) override;
    void onBFSComponentTransition(int nextComponentRoot) override;
    void onBFSTraversalComplete(int vertices, int src, const std::vector<int> &traversalOrder, const std::vector<std::vector<int>> &adjList) override;

    // DFS hooks
    void onDFSTraversalStart(int vertices, int src, const std::vector<std::vector<int>> &adjList) override;
    void onDFSVertexEnter(int u, const std::vector<int> &callStack, const std::vector<bool> &visited) override;
    void onDFSNeighborInspect(int u, int v, bool alreadyVisited) override;
    void onDFSVertexBacktrack(int u, const std::vector<int> &callStack) override;
    void onDFSComponentTransition(int nextComponentRoot) override;
    void onDFSTraversalComplete(int vertices, int src, const std::vector<int> &traversalOrder, const std::vector<std::vector<int>> &adjList) override;

    // Inspection & serialization
    const std::vector<StepEvent>& getEvents() const;
    void clear();

    std::string serializeEvent(const StepEvent &ev) const;
    std::string serializeEvents() const;
    static std::string escapeJson(const std::string &s);
};
