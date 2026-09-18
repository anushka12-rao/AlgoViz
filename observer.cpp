#include "observer.h"
#include "utils.h"
#include <iostream>

using namespace std;

ConsoleObserver::ConsoleObserver(bool mode) : autoMode(mode) {}

bool ConsoleObserver::isAutoMode() const {
    return autoMode;
}

void ConsoleObserver::onPause(int ms) {
    if (autoMode)
        pause(ms);
    else
        waitForEnter();
}

void ConsoleObserver::onInitial(const std::vector<int> &arr) {
    cout << "\n" << YELLOW << "Initial Array:" << RESET << "\n";
    printArray(const_cast<int*>(arr.data()), arr.size());
    waitForEnter();
}

void ConsoleObserver::onPassStart(int passNum, const std::vector<int> &arr) {
    printPass(passNum);
}

void ConsoleObserver::onEarlyExit(const std::vector<int> &arr, int passNum, int comparisons, int swaps) {
    cout << GREEN << "\nOptimized Check: No swaps occurred. Array is fully sorted early!" << RESET << "\n";
}

// ----------------------------------------------------------------------------
// Bubble Sort Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onBubbleCompare(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) {
    cout << "\nComparing indices " << pos1 << " and " << pos2 << ":\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), pos1, pos2);
}

void ConsoleObserver::onBubbleSwap(const std::vector<int> &arr, int pos1, int pos2, int valA, int valB, int comparisons, int swaps, int passes) {
    printSwap(valA, valB);
}

void ConsoleObserver::onBubbleNoSwap(const std::vector<int> &arr, int pos1, int pos2, int comparisons, int swaps, int passes) {
    printNoSwap();
}

void ConsoleObserver::onBubblePassEnd(const std::vector<int> &arr, int passNum, int sortedFrom, int comparisons, int swaps) {
    cout << "\nEnd of Pass " << passNum << ". Current array status:\n";
    printArraySorted(const_cast<int*>(arr.data()), arr.size(), sortedFrom);
}

void ConsoleObserver::onBubbleComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) {
    printHeader("SORTING COMPLETE");
    cout << GREEN << "Final Sorted Array:" << RESET << "\n";
    printArraySorted(const_cast<int*>(arr.data()), arr.size(), 0);
    printStats(comparisons, swaps, passes);
    printComplexity("O(n)", "O(n^2)", "O(n^2)", "O(1)");
}

// ----------------------------------------------------------------------------
// Selection Sort Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onSelectionBoundary(const std::vector<int> &arr, int boundaryIdx, int val) {
    cout << CYAN << "Current unsorted boundary starts at index " << boundaryIdx << " (Value: " << val << ")" << RESET << "\n";
}

void ConsoleObserver::onSelectionCompare(const std::vector<int> &arr, int minIdx, int scanIdx, int minVal, int targetVal, int comparisons) {
    cout << "\nComparing current min [Index " << minIdx << ": " << minVal
         << "] with target [Index " << scanIdx << ": " << targetVal << "]:\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), minIdx, scanIdx);
}

void ConsoleObserver::onSelectionNewMin(const std::vector<int> &arr, int newMinIdx, int val) {
    cout << GREEN << "--> New minimum found at index " << newMinIdx << " (" << val << ")!" << RESET << "\n";
}

void ConsoleObserver::onSelectionPreSwap(const std::vector<int> &arr, int idxI, int minIdx, int valI, int minVal) {
    cout << "\nSwapping index " << idxI << " (" << valI << ") and minimum index " << minIdx << " (" << minVal << "):\n";
    printSwap(valI, minVal);
}

void ConsoleObserver::onSelectionNoSwap(const std::vector<int> &arr, int idxI, int valI) {
    cout << "\nElement " << valI << " at index " << idxI << " is already in correct position.\n";
    printNoSwap();
}

void ConsoleObserver::onSelectionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int swaps) {
    cout << "\nEnd of Pass " << passNum << ". Sorted array up to index " << sortedTo << ":\n";
    printArraySorted(const_cast<int*>(arr.data()), arr.size(), sortedTo);
}

void ConsoleObserver::onSelectionComplete(const std::vector<int> &arr, int comparisons, int swaps, int passes) {
    printHeader("SELECTION SORT COMPLETE");
    cout << GREEN << "Final Sorted Array: " << RESET << "\n";
    printArraySorted(const_cast<int*>(arr.data()), arr.size(), arr.size() - 1);
    printStats(comparisons, swaps, passes);
    printComplexity("O(n^2)", "O(n^2)", "O(n^2)", "O(1)");
}

// ----------------------------------------------------------------------------
// Insertion Sort Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onInsertionKeyExtracted(const std::vector<int> &arr, int keyIdx, int keyVal) {
    cout << CYAN << "Inserting Key = " << keyVal << "(from index " << keyIdx << ") into sorted subarray [0..." << keyIdx - 1 << "]" << RESET << "\n";
}

void ConsoleObserver::onInsertionCompare(const std::vector<int> &arr, int pos1, int pos2, int keyVal, int compVal, int comparisons) {
    cout << "\nComparing key (" << keyVal << ") with element at index " << pos1 << "(" << compVal << "):\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), pos1, pos2);
}

void ConsoleObserver::onInsertionShift(const std::vector<int> &arr, int fromIdx, int toIdx, int shiftedVal, int keyVal, int shifts) {
    cout << YELLOW << "--> " << shiftedVal << " > " << keyVal
         << " , shifting " << shiftedVal << " right to index " << toIdx << RESET << "\n";
}

void ConsoleObserver::onInsertionFoundPosition(const std::vector<int> &arr, int pos, int keyVal, int compVal) {
    cout << GREEN << "-->" << compVal << " <= " << keyVal
         << ",correct insertion position found!" << RESET << "\n";
}

void ConsoleObserver::onInsertionPlacedKey(const std::vector<int> &arr, int placedIdx, int keyVal) {
    cout << "\nPlaced key (" << keyVal << ") at index " << placedIdx << ".\n";
}

void ConsoleObserver::onInsertionPassEnd(const std::vector<int> &arr, int passNum, int sortedTo, int comparisons, int shifts) {
    cout << "\nEnd of pass " << passNum << ". Sorted array up to index " << sortedTo << ":\n";
    printArraySorted(const_cast<int*>(arr.data()), arr.size(), sortedTo);
}

void ConsoleObserver::onInsertionComplete(const std::vector<int> &arr, int comparisons, int shifts, int passes) {
    printHeader(" INSERTION SORT COMPLETE");
    cout << GREEN << "Final Sorted Array:" << RESET << "\n";
    printArraySorted(const_cast<int*>(arr.data()), arr.size(), arr.size() - 1);
    printStats(comparisons, shifts, passes);
    printComplexity("O(n)", "O(n^2)", "O(n^2)", "O(1)");
}
