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
    std::map<std::string, int> stats;

    StepEvent() : step_index(0), canonical_duration_ms(0), sorted_boundary(-1) {}
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
};
