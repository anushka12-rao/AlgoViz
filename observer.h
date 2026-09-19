#pragma once
#include <vector>
#include <string>
#include <map>

// Generic step event payload capturing algorithm state transitions
struct StepEvent {
    int step_index;
    std::string action;
    std::string message;
    int canonical_duration_ms;
    std::vector<int> active_indices;
    std::vector<int> array_state;
    int sorted_boundary;
    int range_st;
    int range_end;
    int range_mid;
    int pivot_idx;
    int pivot_val;
    std::map<std::string, int> stats;

    StepEvent() : step_index(0), canonical_duration_ms(0), sorted_boundary(-1),
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
};
