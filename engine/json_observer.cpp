#include "json_observer.h"
#include <sstream>
#include <iomanip>

using namespace std;

JsonObserver::JsonObserver() : stepCounter(0) {}

JsonObserver::~JsonObserver() {}

bool JsonObserver::isAutoMode() const {
    return true;
}

void JsonObserver::onPause(int ms) {
    if (!events.empty()) {
        events.back().canonical_duration_ms = ms;
    }
}

const std::vector<StepEvent>& JsonObserver::getEvents() const {
    return events;
}

void JsonObserver::clear() {
    stepCounter = 0;
    events.clear();
}

std::string JsonObserver::escapeJson(const std::string &s) {
    ostringstream o;
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else if (static_cast<unsigned char>(c) < 0x20) {
            o << "\\u" << hex << setw(4) << setfill('0') << static_cast<int>(static_cast<unsigned char>(c));
        } else {
            o << c;
        }
    }
    return o.str();
}

// ----------------------------------------------------------------------------
// Common Lifecycle
// ----------------------------------------------------------------------------

void JsonObserver::onInitial(const std::vector<int> &arr) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INITIAL";
    ev.message = "Initial array state";
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onPassStart(int passNum, const std::vector<int> &arr) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PASS_START";
    ev.message = "Starting Pass " + to_string(passNum);
    ev.array_state = arr;
    ev.stats["passes"] = passNum;
    events.push_back(ev);
}

void JsonObserver::onEarlyExit(const std::vector<int> &arr, int passNum, int comparisons, int swaps) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "EARLY_EXIT";
    ev.message = "Optimized Check: No swaps occurred. Array is fully sorted early!";
    ev.array_state = arr;
    ev.stats["passes"] = passNum;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Bubble Sort Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onBubbleCompare(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPARE";
    ev.message = "Comparing indices " + to_string(pos1) + " and " + to_string(pos2) + ": " + to_string(arr[pos1]) + " and " + to_string(arr[pos2]);
    ev.active_indices = {pos1, pos2};
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    ev.stats["passes"] = passes;
    events.push_back(ev);
}

void JsonObserver::onBubbleSwap(const std::vector<int> &arr, int pos1, int pos2, int valA, int valB, int comparisons, int swaps, int passes) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SWAP";
    ev.message = "Swapping " + to_string(valB) + " and " + to_string(valA);
    ev.active_indices = {pos1, pos2};
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    ev.stats["passes"] = passes;
    events.push_back(ev);
}

void JsonObserver::onBubbleNoSwap(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "NO_SWAP";
    ev.message = "No swap needed for indices " + to_string(pos1) + " and " + to_string(pos2);
    ev.active_indices = {pos1, pos2};
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    ev.stats["passes"] = passes;
    events.push_back(ev);
}

void JsonObserver::onBubblePassEnd(const std::vector<int> &arr, int passNum, int sortedFrom, int comparisons, int swaps) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PASS_END";
    ev.message = "End of Pass " + to_string(passNum) + ". Current array status";
    ev.sorted_boundary = sortedFrom;
    ev.array_state = arr;
    ev.stats["passes"] = passNum;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    events.push_back(ev);
}

void JsonObserver::onBubbleComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = "Bubble Sort Complete";
    ev.sorted_boundary = 0;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    ev.stats["passes"] = passes;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Selection Sort Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onSelectionBoundary(const std::vector<int> &arr, int boundaryIdx, int val) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BOUNDARY";
    ev.message = "Current unsorted boundary starts at index " + to_string(boundaryIdx) + " (Value: " + to_string(val) + ")";
    ev.active_indices = {boundaryIdx};
    ev.sorted_boundary = boundaryIdx;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onSelectionCompare(const std::vector<int> &arr, int minIdx, int scanIdx, int minVal, int targetVal, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPARE";
    ev.message = "Comparing current min [Index " + to_string(minIdx) + ": " + to_string(minVal) + "] with target [Index " + to_string(scanIdx) + ": " + to_string(targetVal) + "]";
    ev.active_indices = {minIdx, scanIdx};
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

void JsonObserver::onSelectionNewMin(const std::vector<int> &arr, int newMinIdx, int val) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "NEW_MIN";
    ev.message = "New minimum found at index " + to_string(newMinIdx) + " (" + to_string(val) + ")!";
    ev.active_indices = {newMinIdx};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onSelectionPreSwap(const std::vector<int> &arr, int idxI, int minIdx, int valI, int minVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SWAP";
    ev.message = "Swapping index " + to_string(idxI) + " (" + to_string(valI) + ") and minimum index " + to_string(minIdx) + " (" + to_string(minVal) + ")";
    ev.active_indices = {idxI, minIdx};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onSelectionNoSwap(const std::vector<int> &arr, int idxI, int valI) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "NO_SWAP";
    ev.message = "Element " + to_string(valI) + " at index " + to_string(idxI) + " is already in correct position";
    ev.active_indices = {idxI};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onSelectionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int swaps) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PASS_END";
    ev.message = "End of Pass " + to_string(passNum) + ". Sorted array up to index " + to_string(sortedTo);
    ev.sorted_boundary = sortedTo;
    ev.array_state = arr;
    ev.stats["passes"] = passNum;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    events.push_back(ev);
}

void JsonObserver::onSelectionComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = "Selection Sort Complete";
    ev.sorted_boundary = arr.empty() ? -1 : static_cast<int>(arr.size() - 1);
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    ev.stats["passes"] = passes;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Insertion Sort Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onInsertionKeyExtracted(const std::vector<int> &arr, int keyIdx, int keyVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "EXTRACT_KEY";
    ev.message = "Inserting Key = " + to_string(keyVal) + " (from index " + to_string(keyIdx) + ")";
    ev.active_indices = {keyIdx};
    ev.pivot_idx = keyIdx;
    ev.pivot_val = keyVal;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onInsertionCompare(const std::vector<int> &arr, int pos1, int pos2, int keyVal, int compVal, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPARE";
    ev.message = "Comparing key (" + to_string(keyVal) + ") with element at index " + to_string(pos1) + " (" + to_string(compVal) + ")";
    ev.active_indices = {pos1, pos2};
    ev.pivot_val = keyVal;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

void JsonObserver::onInsertionShift(const std::vector<int> &arr, int fromIdx, int toIdx, int shiftedVal, int keyVal, int shifts) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SHIFT";
    ev.message = "Shifting " + to_string(shiftedVal) + " right to index " + to_string(toIdx);
    ev.active_indices = {fromIdx, toIdx};
    ev.pivot_val = keyVal;
    ev.array_state = arr;
    ev.stats["shifts"] = shifts;
    events.push_back(ev);
}

void JsonObserver::onInsertionFoundPosition(const std::vector<int> &arr, int pos, int keyVal, int compVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "FOUND_POS";
    ev.message = "Key (" + to_string(keyVal) + ") >= " + to_string(compVal) + ". Correct position found at index " + to_string(pos);
    ev.active_indices = {pos};
    ev.pivot_val = keyVal;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onInsertionPlacedKey(const std::vector<int> &arr, int placedIdx, int keyVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INSERT_KEY";
    ev.message = "Placed key " + to_string(keyVal) + " into sorted position [Index " + to_string(placedIdx) + "]";
    ev.active_indices = {placedIdx};
    ev.pivot_val = keyVal;
    ev.pivot_idx = placedIdx;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onInsertionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int shifts) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PASS_END";
    ev.message = "End of Pass " + to_string(passNum) + ". Array sorted up to index " + to_string(sortedTo);
    ev.sorted_boundary = sortedTo;
    ev.array_state = arr;
    ev.stats["passes"] = passNum;
    ev.stats["comparisons"] = comparisons;
    ev.stats["shifts"] = shifts;
    events.push_back(ev);
}

void JsonObserver::onInsertionComplete(const std::vector<int> &arr, int comparisons, int shifts, int passes) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = "Insertion Sort Complete";
    ev.sorted_boundary = arr.empty() ? -1 : static_cast<int>(arr.size() - 1);
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["shifts"] = shifts;
    ev.stats["passes"] = passes;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Merge Sort Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onMergeSplit(const std::vector<int> &arr, int st, int mid, int end) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SPLIT";
    ev.message = "Splitting range [" + to_string(st) + "..." + to_string(end) + "] at mid = " + to_string(mid);
    ev.range_st = st;
    ev.range_mid = mid;
    ev.range_end = end;
    ev.active_indices = {st, mid, end};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onMergeStart(const std::vector<int> &arr, int st, int mid, int end) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "MERGE_START";
    ev.message = "Merging subarrays [" + to_string(st) + "..." + to_string(mid) + "] and [" + to_string(mid + 1) + "..." + to_string(end) + "]";
    ev.range_st = st;
    ev.range_mid = mid;
    ev.range_end = end;
    ev.active_indices = {st, end};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onMergeCompare(const std::vector<int> &arr, int leftIdx, int rightIdx, int leftVal, int rightVal, bool leftChosen, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "MERGE_COMPARE";
    ev.message = "Comparing left [" + to_string(leftVal) + "] and right [" + to_string(rightVal) + "]. Choosing " + (leftChosen ? "left" : "right");
    ev.active_indices = {leftIdx, rightIdx};
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

void JsonObserver::onMergeCopyRemaining(const std::vector<int> &arr, int idx, int val, bool isLeft) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = isLeft ? "COPY_REMAINING_LEFT" : "COPY_REMAINING_RIGHT";
    ev.message = "Copying remaining element from " + string(isLeft ? "left" : "right") + " half: " + to_string(val);
    ev.active_indices = {idx};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onMergeSectionEnd(const std::vector<int> &arr, int st, int end, int mergesCount) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "MERGED_SECTION";
    ev.message = "Merged section [" + to_string(st) + "..." + to_string(end) + "] complete";
    ev.range_st = st;
    ev.range_end = end;
    ev.active_indices = {st, end};
    ev.array_state = arr;
    ev.stats["merges"] = mergesCount;
    events.push_back(ev);
}

void JsonObserver::onMergeComplete(const std::vector<int> &arr, int comparisons, int mergesCount) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = "Merge Sort Complete";
    ev.sorted_boundary = 0;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["merges"] = mergesCount;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Quick Sort Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onQuickPartitionStart(const std::vector<int> &arr, int st, int end, int pivotVal, int pivotIdx) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PARTITION_START";
    ev.message = "Starting Lomuto partition on range [" + to_string(st) + "..." + to_string(end) + "] with pivot = " + to_string(pivotVal);
    ev.range_st = st;
    ev.range_end = end;
    ev.pivot_idx = pivotIdx;
    ev.pivot_val = pivotVal;
    ev.active_indices = {pivotIdx};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onQuickComparePivot(const std::vector<int> &arr, int j, int pivotIdx, int jVal, int pivotVal, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPARE";
    ev.message = "Comparing index " + to_string(j) + " (" + to_string(jVal) + ") with pivot (" + to_string(pivotVal) + ")";
    ev.active_indices = {j, pivotIdx};
    ev.pivot_idx = pivotIdx;
    ev.pivot_val = pivotVal;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

void JsonObserver::onQuickSwap(const std::vector<int> &arr, int idx, int j, int valIdxOriginal, int valJOriginal, int pivotVal, int comparisons, int swaps) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SWAP";
    ev.message = "Swapping index " + to_string(idx) + " (" + to_string(valIdxOriginal) + ") and index " + to_string(j) + " (" + to_string(valJOriginal) + ")";
    ev.active_indices = {idx, j};
    ev.pivot_val = pivotVal;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    events.push_back(ev);
}

void JsonObserver::onQuickSameIndex(const std::vector<int> &arr, int idx, int valIdx, int pivotVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SAME_INDEX";
    ev.message = "Element at index " + to_string(idx) + " (" + to_string(valIdx) + ") already in partition position";
    ev.active_indices = {idx};
    ev.pivot_val = pivotVal;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onQuickGreater(const std::vector<int> &arr, int j, int pivotIdx, int valJ, int pivotVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "GREATER";
    ev.message = "Element " + to_string(valJ) + " > pivot " + to_string(pivotVal) + ", staying in right partition";
    ev.active_indices = {j, pivotIdx};
    ev.pivot_idx = pivotIdx;
    ev.pivot_val = pivotVal;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onQuickPivotPlaced(const std::vector<int> &arr, int pivotIdx, int oldEndIdx, int pivotVal, int st, int end, int swaps) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PIVOT_PLACED";
    ev.message = "Placed pivot " + to_string(pivotVal) + " into final sorted position [Index " + to_string(pivotIdx) + "]";
    ev.active_indices = {pivotIdx};
    ev.pivot_idx = pivotIdx;
    ev.pivot_val = pivotVal;
    ev.range_st = st;
    ev.range_end = end;
    ev.array_state = arr;
    ev.stats["swaps"] = swaps;
    events.push_back(ev);
}

void JsonObserver::onQuickSubparts(const std::vector<int> &arr, int pivIdx, int st, int end) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SUBPARTS";
    ev.message = "Dividing into left [" + to_string(st) + "..." + to_string(pivIdx - 1) + "] and right [" + to_string(pivIdx + 1) + "..." + to_string(end) + "]";
    ev.pivot_idx = pivIdx;
    ev.range_st = st;
    ev.range_end = end;
    ev.active_indices = {pivIdx};
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onQuickComplete(const std::vector<int> &arr, int comparisons, int swaps) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = "Quick Sort Complete";
    ev.sorted_boundary = 0;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    ev.stats["swaps"] = swaps;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Linear Search Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onLinearSearchStart(const std::vector<int> &arr, int target) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SEARCH_START";
    ev.message = "Starting linear search for target " + to_string(target);
    ev.pivot_val = target;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onLinearSearchCheck(const std::vector<int> &arr, int currentIndex, int target, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "CHECK";
    ev.message = "Checking index [" + to_string(currentIndex) + "] -> Value: " + to_string(arr[currentIndex]);
    ev.active_indices = {currentIndex};
    ev.pivot_val = target;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

void JsonObserver::onLinearSearchMatch(const std::vector<int> &arr, int index, int target) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "MATCH";
    ev.message = "Element found! Value " + to_string(target) + " located at index " + to_string(index);
    ev.active_indices = {index};
    ev.pivot_val = target;
    ev.pivot_idx = index;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onLinearSearchMismatch(const std::vector<int> &arr, int index, int currentVal, int target) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "MISMATCH";
    ev.message = "Value " + to_string(currentVal) + " != target " + to_string(target) + ", continuing search";
    ev.active_indices = {index};
    ev.pivot_val = target;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onLinearSearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = resultIndex != -1 ? ("Found target at index " + to_string(resultIndex)) : "Element not found in array (-1)";
    ev.pivot_val = target;
    ev.pivot_idx = resultIndex;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Binary Search Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onBinarySearchStart(const std::vector<int> &arr, int target) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SEARCH_START";
    ev.message = "Starting binary search for target " + to_string(target);
    ev.pivot_val = target;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onBinarySearchStep(const std::vector<int> &arr, int st, int mid, int end, int target, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "STEP";
    ev.message = "Evaluating window [st=" + to_string(st) + ", mid=" + to_string(mid) + ", end=" + to_string(end) + "]";
    ev.active_indices = {mid};
    ev.range_st = st;
    ev.range_mid = mid;
    ev.range_end = end;
    ev.pivot_val = target;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

void JsonObserver::onBinarySearchGreater(const std::vector<int> &arr, int mid, int target, int midVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "GREATER";
    ev.message = "Target (" + to_string(target) + ") > mid (" + to_string(midVal) + "), searching right half";
    ev.active_indices = {mid};
    ev.range_mid = mid;
    ev.pivot_val = target;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onBinarySearchSmaller(const std::vector<int> &arr, int mid, int target, int midVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SMALLER";
    ev.message = "Target (" + to_string(target) + ") < mid (" + to_string(midVal) + "), searching left half";
    ev.active_indices = {mid};
    ev.range_mid = mid;
    ev.pivot_val = target;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onBinarySearchMatch(const std::vector<int> &arr, int mid, int target, int midVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "MATCH";
    ev.message = "Match found! Target (" + to_string(target) + ") equals mid element (" + to_string(midVal) + ")";
    ev.active_indices = {mid};
    ev.range_mid = mid;
    ev.pivot_val = target;
    ev.pivot_idx = mid;
    ev.array_state = arr;
    events.push_back(ev);
}

void JsonObserver::onBinarySearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "COMPLETE";
    ev.message = resultIndex != -1 ? ("Found target at index " + to_string(resultIndex)) : "Target not found in array (-1)";
    ev.pivot_val = target;
    ev.pivot_idx = resultIndex;
    ev.array_state = arr;
    ev.stats["comparisons"] = comparisons;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Stack Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onStackInit(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INIT";
    ev.message = "Stack initialized";
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onStackPush(const std::vector<int> &elements, int val, int highlightIdx) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PUSH";
    ev.message = "Pushed value " + to_string(val) + " onto stack";
    ev.array_state = elements;
    ev.active_indices = {highlightIdx};
    ev.pivot_val = val;
    events.push_back(ev);
}

void JsonObserver::onStackOverflow(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "OVERFLOW";
    ev.message = "Stack Overflow! Maximum capacity reached";
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onStackPop(const std::vector<int> &elements, int poppedVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "POP";
    ev.message = "Popped value " + to_string(poppedVal) + " from stack";
    ev.array_state = elements;
    ev.pivot_val = poppedVal;
    events.push_back(ev);
}

void JsonObserver::onStackUnderflow(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "UNDERFLOW";
    ev.message = "Stack Underflow! Stack is empty";
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onStackTop(const std::vector<int> &elements, int topVal, int highlightIdx, bool empty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "TOP";
    ev.message = empty ? "Stack is empty, no top element" : ("Top element is " + to_string(topVal));
    ev.array_state = elements;
    if (!empty) ev.active_indices = {highlightIdx};
    ev.pivot_val = topVal;
    ev.stats["empty"] = empty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onStackEmptyCheck(const std::vector<int> &elements, bool isEmpty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "EMPTY_CHECK";
    ev.message = isEmpty ? "Stack is empty" : "Stack is not empty";
    ev.array_state = elements;
    ev.stats["is_empty"] = isEmpty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onStackClear(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "CLEAR";
    ev.message = "Stack cleared";
    ev.array_state = elements;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Queue Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onQueueInit(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INIT";
    ev.message = "Queue initialized";
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onQueuePush(const std::vector<int> &elements, int val) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PUSH";
    ev.message = "Enqueued value " + to_string(val);
    ev.array_state = elements;
    if (!elements.empty()) ev.active_indices = {static_cast<int>(elements.size() - 1)};
    ev.pivot_val = val;
    events.push_back(ev);
}

void JsonObserver::onQueuePop(const std::vector<int> &elements, int removedVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "POP";
    ev.message = "Dequeued value " + to_string(removedVal);
    ev.array_state = elements;
    ev.pivot_val = removedVal;
    events.push_back(ev);
}

void JsonObserver::onQueueUnderflow(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "UNDERFLOW";
    ev.message = "Queue Underflow! Queue is empty";
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onQueueFront(const std::vector<int> &elements, int frontVal, bool empty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "FRONT";
    ev.message = empty ? "Queue is empty, no front element" : ("Front element is " + to_string(frontVal));
    ev.array_state = elements;
    if (!empty) ev.active_indices = {0};
    ev.pivot_val = frontVal;
    ev.stats["empty"] = empty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onQueueEmptyCheck(const std::vector<int> &elements, bool isEmpty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "EMPTY_CHECK";
    ev.message = isEmpty ? "Queue is empty" : "Queue is not empty";
    ev.array_state = elements;
    ev.stats["is_empty"] = isEmpty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onQueueClear(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "CLEAR";
    ev.message = "Queue cleared";
    ev.array_state = elements;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Linked List Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onListInit(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INIT";
    ev.message = "Linked list initialized";
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onListPushFront(const std::vector<int> &elements, int val, int highlightIdx) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PUSH_FRONT";
    ev.message = "Inserted " + to_string(val) + " at head";
    ev.array_state = elements;
    ev.active_indices = {highlightIdx};
    ev.pivot_val = val;
    events.push_back(ev);
}

void JsonObserver::onListPushBack(const std::vector<int> &elements, int val, int highlightIdx) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "PUSH_BACK";
    ev.message = "Inserted " + to_string(val) + " at tail";
    ev.array_state = elements;
    ev.active_indices = {highlightIdx};
    ev.pivot_val = val;
    events.push_back(ev);
}

void JsonObserver::onListPopFront(const std::vector<int> &elements, int removedVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "POP_FRONT";
    ev.message = "Deleted head node with value " + to_string(removedVal);
    ev.array_state = elements;
    ev.pivot_val = removedVal;
    events.push_back(ev);
}

void JsonObserver::onListPopBack(const std::vector<int> &elements, int removedVal) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "POP_BACK";
    ev.message = "Deleted tail node with value " + to_string(removedVal);
    ev.array_state = elements;
    ev.pivot_val = removedVal;
    events.push_back(ev);
}

void JsonObserver::onListUnderflow(const std::vector<int> &elements, const std::string &op) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "UNDERFLOW";
    ev.message = "List Underflow! List is empty during " + op;
    ev.array_state = elements;
    events.push_back(ev);
}

void JsonObserver::onListSearch(const std::vector<int> &elements, int key, int foundIdx, bool wasEmpty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SEARCH";
    if (wasEmpty) {
        ev.message = "List is empty, cannot search";
    } else if (foundIdx != -1) {
        ev.message = "Element " + to_string(key) + " found at position " + to_string(foundIdx);
        ev.active_indices = {foundIdx};
    } else {
        ev.message = "Element " + to_string(key) + " not found in list";
    }
    ev.array_state = elements;
    ev.pivot_val = key;
    ev.pivot_idx = foundIdx;
    ev.stats["found"] = foundIdx != -1 ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onListClear(const std::vector<int> &elements) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "CLEAR";
    ev.message = "Linked list cleared";
    ev.array_state = elements;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Binary Tree Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onBinaryTreeInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INIT";
    ev.message = msg.empty() ? "Binary Tree initialized" : msg;
    ev.tree_state = tree;
    events.push_back(ev);
}

void JsonObserver::onBinaryTreeInsert(const std::vector<TreeNodeRecord> &tree, int parentVal, int newVal, char side, bool success, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INSERT";
    ev.message = msg;
    ev.tree_state = tree;
    ev.pivot_val = newVal;
    ev.pivot_idx = parentVal;
    ev.stats["success"] = success ? 1 : 0;
    ev.stats["side"] = static_cast<int>(side);
    events.push_back(ev);
}

void JsonObserver::onBinaryTreeBuildPreorder(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &preorder, bool success, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BUILD_PREORDER";
    ev.message = msg;
    ev.tree_state = tree;
    ev.array_state = preorder;
    ev.stats["success"] = success ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBinaryTreeTraversal(const std::vector<TreeNodeRecord> &tree, const std::string &traversalType, const std::vector<int> &result, bool empty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "TRAVERSAL";
    ev.message = empty ? (traversalType + " traversal: tree is empty") : (traversalType + " traversal completed");
    ev.tree_state = tree;
    ev.array_state = result;
    ev.stats["empty"] = empty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBinaryTreeLevelOrder(const std::vector<TreeNodeRecord> &tree, const std::vector<std::vector<int>> &levels, bool empty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "LEVEL_ORDER";
    ev.message = empty ? "Level-order traversal: tree is empty" : "Level-order traversal completed";
    ev.tree_state = tree;
    for (const auto &lvl : levels) {
        for (int v : lvl) ev.array_state.push_back(v);
    }
    ev.stats["empty"] = empty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBinaryTreeMetrics(const std::vector<TreeNodeRecord> &tree, int count, int height, int sum, bool empty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "METRICS";
    ev.message = empty ? "Tree metrics calculated: tree is empty" : "Tree metrics calculated";
    ev.tree_state = tree;
    ev.stats["count"] = count;
    ev.stats["height"] = height;
    ev.stats["sum"] = sum;
    ev.stats["empty"] = empty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBinaryTreeClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "CLEAR";
    ev.message = msg.empty() ? "Binary tree cleared" : msg;
    ev.tree_state = tree;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// BST Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onBSTInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INIT";
    ev.message = msg.empty() ? "BST initialized" : msg;
    ev.tree_state = tree;
    events.push_back(ev);
}

void JsonObserver::onBSTInsertBatch(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &inputValues, int addedCount, int duplicateCount, const std::vector<int> &sortedValues, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "INSERT_BATCH";
    ev.message = msg;
    ev.tree_state = tree;
    ev.array_state = sortedValues;
    ev.stats["added"] = addedCount;
    ev.stats["duplicates"] = duplicateCount;
    events.push_back(ev);
}

void JsonObserver::onBSTSearch(const std::vector<TreeNodeRecord> &tree, int target, bool found, const std::vector<std::string> &path, const std::vector<int> &sortedValues, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SEARCH";
    ev.message = msg;
    ev.tree_state = tree;
    ev.array_state = sortedValues;
    ev.pivot_val = target;
    ev.stats["found"] = found ? 1 : 0;
    ev.stats["path_length"] = static_cast<int>(path.size());
    events.push_back(ev);
}

void JsonObserver::onBSTDelete(const std::vector<TreeNodeRecord> &tree, int val, bool deleted, const std::vector<int> &sortedValues, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DELETE";
    ev.message = msg;
    ev.tree_state = tree;
    ev.array_state = sortedValues;
    ev.pivot_val = val;
    ev.stats["deleted"] = deleted ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBSTSorted(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &sortedValues, bool empty) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "SORTED_VIEW";
    ev.message = empty ? "BST is empty" : "In-order sorted traversal";
    ev.tree_state = tree;
    ev.array_state = sortedValues;
    ev.stats["empty"] = empty ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBSTClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "CLEAR";
    ev.message = msg.empty() ? "BST cleared" : msg;
    ev.tree_state = tree;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Graph Hooks
// ----------------------------------------------------------------------------

void JsonObserver::onGraphInit(int vertices) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "GRAPH_INIT";
    ev.message = "Graph initialized with " + to_string(vertices) + " vertices";
    ev.stats["vertices"] = vertices;
    events.push_back(ev);
}

void JsonObserver::onGraphAddEdge(int u, int v, bool success) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "ADD_EDGE";
    ev.message = success ? ("Edge added between " + to_string(u) + " and " + to_string(v)) : ("Failed to add edge between " + to_string(u) + " and " + to_string(v));
    ev.active_indices = {u, v};
    ev.stats["success"] = success ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onGraphPrint(int vertices, const std::vector<std::vector<int>> &adjList) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "GRAPH_PRINT";
    ev.message = "Graph adjacency list snapshot";
    ev.graph_adj = adjList;
    ev.stats["vertices"] = vertices;
    events.push_back(ev);
}

void JsonObserver::onBFSTraversalStart(int vertices, int src, const std::vector<std::vector<int>> &adjList) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BFS_START";
    ev.message = "BFS Traversal started from source vertex " + to_string(src);
    ev.current_vertex = src;
    ev.graph_adj = adjList;
    ev.stats["vertices"] = vertices;
    events.push_back(ev);
}

void JsonObserver::onBFSVertexDequeued(int u, const std::vector<int> &currentQueue, const std::vector<bool> &visited) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BFS_DEQUEUE";
    ev.message = "Dequeued and visited vertex " + to_string(u);
    ev.current_vertex = u;
    ev.graph_queue = currentQueue;
    ev.graph_visited = visited;
    events.push_back(ev);
}

void JsonObserver::onBFSNeighborInspect(int u, int v, bool alreadyVisited) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BFS_INSPECT";
    ev.message = "Inspecting neighbor " + to_string(v) + " of vertex " + to_string(u) + (alreadyVisited ? " (already visited)" : " (unvisited)");
    ev.current_vertex = u;
    ev.active_indices = {u, v};
    ev.stats["already_visited"] = alreadyVisited ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onBFSVertexEnqueued(int v, const std::vector<int> &currentQueue, const std::vector<bool> &visited) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BFS_ENQUEUE";
    ev.message = "Enqueued vertex " + to_string(v);
    ev.current_vertex = v;
    ev.graph_queue = currentQueue;
    ev.graph_visited = visited;
    events.push_back(ev);
}

void JsonObserver::onBFSComponentTransition(int nextComponentRoot) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BFS_COMPONENT_TRANSITION";
    ev.message = "Transitioning to disconnected component at vertex " + to_string(nextComponentRoot);
    ev.current_vertex = nextComponentRoot;
    events.push_back(ev);
}

void JsonObserver::onBFSTraversalComplete(int vertices, int src, const std::vector<int> &traversalOrder, const std::vector<std::vector<int>> &adjList) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "BFS_COMPLETE";
    ev.message = "BFS traversal complete";
    ev.graph_traversal = traversalOrder;
    ev.graph_adj = adjList;
    ev.current_vertex = src;
    ev.stats["vertices"] = vertices;
    events.push_back(ev);
}

void JsonObserver::onDFSTraversalStart(int vertices, int src, const std::vector<std::vector<int>> &adjList) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DFS_START";
    ev.message = "DFS Traversal started from source vertex " + to_string(src);
    ev.current_vertex = src;
    ev.graph_adj = adjList;
    ev.stats["vertices"] = vertices;
    events.push_back(ev);
}

void JsonObserver::onDFSVertexEnter(int u, const std::vector<int> &callStack, const std::vector<bool> &visited) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DFS_ENTER";
    ev.message = "Entering and visiting vertex " + to_string(u);
    ev.current_vertex = u;
    ev.graph_queue = callStack; // Store active call stack in graph_queue for visualization
    ev.graph_visited = visited;
    events.push_back(ev);
}

void JsonObserver::onDFSNeighborInspect(int u, int v, bool alreadyVisited) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DFS_INSPECT";
    ev.message = "Inspecting neighbor " + to_string(v) + " of vertex " + to_string(u) + (alreadyVisited ? " (already visited)" : " (unvisited)");
    ev.current_vertex = u;
    ev.active_indices = {u, v};
    ev.stats["already_visited"] = alreadyVisited ? 1 : 0;
    events.push_back(ev);
}

void JsonObserver::onDFSVertexBacktrack(int u, const std::vector<int> &callStack) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DFS_BACKTRACK";
    ev.message = "Backtracking from vertex " + to_string(u);
    ev.current_vertex = u;
    ev.graph_queue = callStack;
    events.push_back(ev);
}

void JsonObserver::onDFSComponentTransition(int nextComponentRoot) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DFS_COMPONENT_TRANSITION";
    ev.message = "Transitioning to disconnected component at vertex " + to_string(nextComponentRoot);
    ev.current_vertex = nextComponentRoot;
    events.push_back(ev);
}

void JsonObserver::onDFSTraversalComplete(int vertices, int src, const std::vector<int> &traversalOrder, const std::vector<std::vector<int>> &adjList) {
    StepEvent ev;
    ev.step_index = ++stepCounter;
    ev.action = "DFS_COMPLETE";
    ev.message = "DFS traversal complete";
    ev.graph_traversal = traversalOrder;
    ev.graph_adj = adjList;
    ev.current_vertex = src;
    ev.stats["vertices"] = vertices;
    events.push_back(ev);
}

// ----------------------------------------------------------------------------
// Serialization
// ----------------------------------------------------------------------------

std::string JsonObserver::serializeEvent(const StepEvent &ev) const {
    ostringstream ss;
    ss << "{\n";
    ss << "  \"step_index\": " << ev.step_index << ",\n";
    ss << "  \"action\": \"" << escapeJson(ev.action) << "\",\n";
    ss << "  \"message\": \"" << escapeJson(ev.message) << "\",\n";
    ss << "  \"canonical_duration_ms\": " << ev.canonical_duration_ms << ",\n";

    // active_indices
    ss << "  \"active_indices\": [";
    for (size_t i = 0; i < ev.active_indices.size(); ++i) {
        ss << (i > 0 ? "," : "") << ev.active_indices[i];
    }
    ss << "],\n";

    // array_state
    ss << "  \"array_state\": [";
    for (size_t i = 0; i < ev.array_state.size(); ++i) {
        ss << (i > 0 ? "," : "") << ev.array_state[i];
    }
    ss << "],\n";

    // tree_state
    ss << "  \"tree_state\": [";
    for (size_t i = 0; i < ev.tree_state.size(); ++i) {
        const auto &node = ev.tree_state[i];
        ss << (i > 0 ? "," : "") << "{\"id\":" << node.id << ",\"val\":" << node.val
           << ",\"left_id\":" << node.left_id << ",\"right_id\":" << node.right_id << "}";
    }
    ss << "],\n";

    // graph_adj
    ss << "  \"graph_adj\": [";
    for (size_t i = 0; i < ev.graph_adj.size(); ++i) {
        ss << (i > 0 ? "," : "") << "[";
        for (size_t j = 0; j < ev.graph_adj[i].size(); ++j) {
            ss << (j > 0 ? "," : "") << ev.graph_adj[i][j];
        }
        ss << "]";
    }
    ss << "],\n";

    // graph_traversal
    ss << "  \"graph_traversal\": [";
    for (size_t i = 0; i < ev.graph_traversal.size(); ++i) {
        ss << (i > 0 ? "," : "") << ev.graph_traversal[i];
    }
    ss << "],\n";

    // graph_queue
    ss << "  \"graph_queue\": [";
    for (size_t i = 0; i < ev.graph_queue.size(); ++i) {
        ss << (i > 0 ? "," : "") << ev.graph_queue[i];
    }
    ss << "],\n";

    // graph_visited
    ss << "  \"graph_visited\": [";
    for (size_t i = 0; i < ev.graph_visited.size(); ++i) {
        ss << (i > 0 ? "," : "") << (ev.graph_visited[i] ? "true" : "false");
    }
    ss << "],\n";

    ss << "  \"current_vertex\": " << ev.current_vertex << ",\n";
    ss << "  \"sorted_boundary\": " << ev.sorted_boundary << ",\n";
    ss << "  \"range_st\": " << ev.range_st << ",\n";
    ss << "  \"range_end\": " << ev.range_end << ",\n";
    ss << "  \"range_mid\": " << ev.range_mid << ",\n";
    ss << "  \"pivot_idx\": " << ev.pivot_idx << ",\n";
    ss << "  \"pivot_val\": " << ev.pivot_val << ",\n";

    // stats
    ss << "  \"stats\": {";
    size_t sIdx = 0;
    for (const auto &pair : ev.stats) {
        ss << (sIdx > 0 ? "," : "") << "\"" << escapeJson(pair.first) << "\":" << pair.second;
        sIdx++;
    }
    ss << "}\n";
    ss << "}";
    return ss.str();
}

std::string JsonObserver::serializeEvents() const {
    ostringstream ss;
    ss << "[\n";
    for (size_t i = 0; i < events.size(); ++i) {
        ss << (i > 0 ? ",\n" : "") << serializeEvent(events[i]);
    }
    ss << "\n]";
    return ss.str();
}
