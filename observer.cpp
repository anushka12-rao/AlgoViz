#include "observer.h"
#include "utils.h"
#include <iostream>
#include <iomanip>

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

// ----------------------------------------------------------------------------
// Helper for printing subarrays
// ----------------------------------------------------------------------------
static void printSubarray(const vector<int> &arr, int st, int end)
{
    cout << "[";
    for (int i = st; i <= end; i++)
    {
        cout << arr[i] << " ";
    }
    cout << "]\n";
}

// ----------------------------------------------------------------------------
// Merge Sort Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onMergeSplit(const std::vector<int> &arr, int st, int mid, int end) {
    cout << "\n"
         << MAGENTA << " Splitting range [" << st << "..." << end
         << "] at mid = " << mid << RESET << "\n";
    cout << " Left half:  [" << st << "..." << mid << "]\n";
    cout << " Right half: [" << mid + 1 << "..." << end << "]\n";
}

void ConsoleObserver::onMergeStart(const std::vector<int> &arr, int st, int mid, int end) {
    cout << "\n"
         << CYAN << "---Merging Subarrays---" << RESET << "\n";
    cout << "Left half [" << st << "..." << mid << "]:";
    printSubarray(arr, st, mid);
    cout << "Right half[" << mid + 1 << "..." << end << "]:";
    printSubarray(arr, mid + 1, end);
}

void ConsoleObserver::onMergeCompare(const std::vector<int> &arr, int leftIdx, int rightIdx, int leftVal, int rightVal, bool leftChosen, int comparisons) {
    cout << "Comparing Left (" << leftVal << ") and Right (" << rightVal << "):\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), leftIdx, rightIdx);

    if (leftChosen)
    {
        cout << GREEN << "--> " << leftVal << "<= " << rightVal
             << ", adding " << leftVal << " to temp " << RESET << "\n";
    }
    else
    {
        cout << GREEN << "--> " << rightVal << " < " << leftVal
             << ", adding " << rightVal << " to temp " << RESET << "\n";
    }
}

void ConsoleObserver::onMergeCopyRemaining(const std::vector<int> &arr, int idx, int val, bool isLeft) {
    if (isLeft)
    {
        cout << YELLOW << "--> Copying remaining Left element " << val << " to temp " << RESET << "\n";
    }
    else
    {
        cout << YELLOW << "--> Copying remaining Right element " << val << " to temp " << RESET << "\n";
    }
}

void ConsoleObserver::onMergeSectionEnd(const std::vector<int> &arr, int st, int end, int mergesCount) {
    cout << "\nMerged section [" << st << "..." << end << "]:";
    printSubarray(arr, st, end);
    cout << " Current Full Array:\n";
    printArray(const_cast<int*>(arr.data()), arr.size());
}

void ConsoleObserver::onMergeComplete(const std::vector<int> &arr, int comparisons, int mergesCount) {
    printHeader("MERGE SORT COMPLETE");
    cout << GREEN << "Final Sorted Array: " << RESET << "\n";
    printArray(const_cast<int*>(arr.data()), arr.size());

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Total Comparisons : " << comparisons << "\n";
    cout << " Total Merge Steps : " << mergesCount << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(nlogn)", "O(nlogn)", "O(nlogn)", "O(n)");
}

// ----------------------------------------------------------------------------
// Quick Sort Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onQuickPartitionStart(const std::vector<int> &arr, int st, int end, int pivotVal, int pivotIdx) {
    cout << "\n"
         << CYAN << "--- Partitioning Range [" << st << "..." << end << "] ---" << RESET << "\n";
    cout << "Subarray: ";
    printSubarray(arr, st, end);
    cout << "Selected Pivot: " << YELLOW << pivotVal << RESET << " (at index " << pivotIdx << ")\n";
}

void ConsoleObserver::onQuickComparePivot(const std::vector<int> &arr, int j, int pivotIdx, int jVal, int pivotVal, int comparisons) {
    cout << "\nComparing arr[" << j << "] (" << jVal << ") with Pivot (" << pivotVal << "):\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), j, pivotIdx);
}

void ConsoleObserver::onQuickSwap(const std::vector<int> &arr, int idx, int j, int valIdxOriginal, int valJOriginal, int pivotVal, int comparisons, int swaps) {
    cout << GREEN << " --> " << valJOriginal << " <= " << pivotVal
         << ", swapping arr[" << j << "] (" << valJOriginal
         << ") with arr[" << idx << "] (" << valIdxOriginal << ")" << RESET << "\n";
    cout << "Array after swap:\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), idx, j);
}

void ConsoleObserver::onQuickSameIndex(const std::vector<int> &arr, int idx, int valIdx, int pivotVal) {
    cout << GREEN << " --> " << valIdx << " <= " << pivotVal
         << ", swapping arr[" << idx << "] (" << valIdx
         << ") with arr[" << idx << "] (" << valIdx << ")" << RESET << "\n";
    cout << "Elements are at same index (" << idx << "), no move needed.\n";
}

void ConsoleObserver::onQuickGreater(const std::vector<int> &arr, int j, int pivotIdx, int valJ, int pivotVal) {
    cout << RED << "--> " << valJ << " > " << pivotVal
         << ", leaving on the right side" << RESET << "\n";
}

void ConsoleObserver::onQuickPivotPlaced(const std::vector<int> &arr, int pivotIdx, int oldEndIdx, int pivotVal, int st, int end, int swaps) {
    cout << "\n"
         << MAGENTA << "Placing pivot (" << pivotVal << ") at correct index " << pivotIdx << RESET << "\n";
    cout << " Array after pivot placement:\n";
    printArrayHighlight(const_cast<int*>(arr.data()), arr.size(), pivotIdx, oldEndIdx);
    cout << " Subarray now: ";
    printSubarray(arr, st, end);
}

void ConsoleObserver::onQuickSubparts(const std::vector<int> &arr, int pivIdx, int st, int end) {
    cout << "\nPivot " << arr[pivIdx] << " is fixed at index " << pivIdx << ".\n";
    cout << "Left partition to sort: [" << st << "..." << pivIdx - 1 << "]\n";
    cout << "Right partition to sort: [" << pivIdx + 1 << "..." << end << "]\n";
}

void ConsoleObserver::onQuickComplete(const std::vector<int> &arr, int comparisons, int swaps) {
    printHeader("QUICK SORT COMPLETE");
    cout << GREEN << "Final Sorted Array:" << RESET << "\n";
    printArray(const_cast<int*>(arr.data()), arr.size());

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Total Comparisons : " << comparisons << "\n";
    cout << " Total Swaps       : " << swaps << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(nlogn)", "O(nlogn)", "O(n^2)", "O(logn)");
}

// ----------------------------------------------------------------------------
// Linear Search Visualizer Helpers
// ----------------------------------------------------------------------------
static void printSearchStep(const int arr[], int sz, int currentIndex, int target)
{
    cout << "[ ";
    for (int i = 0; i < sz; i++)
    {
        if (i == currentIndex)
        {
            if (arr[i] == target)
            {
                cout << GREEN << "[" << arr[i] << "]" << RESET << " ";
            }
            else
            {
                cout << YELLOW << "[" << arr[i] << "]" << RESET << " ";
            }
        }
        else
        {
            cout << arr[i] << " ";
        }
    }
    cout << "]\n";
}

// ----------------------------------------------------------------------------
// Binary Search Visualizer Helpers
// ----------------------------------------------------------------------------
static void printbinarySearchState(const vector<int> &arr, int st, int mid, int end, int tar)
{
    int n = arr.size();

    cout << "\nIndex: ";
    for (int i = 0; i < n; i++)
    {
        cout << setw(6) << i;
    }

    cout << "\nArray: ";
    for (int i = 0; i < n; i++)
    {
        if (i == mid)
        {
            string val = "[" + to_string(arr[i]) + "]";
            if (arr[i] == tar)
                cout << GREEN << setw(6) << val << RESET;
            else
                cout << YELLOW << setw(6) << val << RESET;
        }
        else if (i >= st && i <= end)
        {
            cout << CYAN << setw(6) << arr[i] << RESET;
        }
        else
        {
            cout << GRAY << setw(6) << arr[i] << RESET;
        }
    }
    cout << "\nPtrs : ";
    for (int i = 0; i < n; i++)
    {
        string ptr = "";
        if (i == st)
            ptr += "st";
        if (i == mid)
            ptr += (ptr.empty() ? "" : "/") + string("mid");
        if (i == end)
            ptr += (ptr.empty() ? "" : "/") + string("end");
        cout << setw(6) << (ptr.empty() ? " " : ptr);
    }
    cout << "\n";
}

// ----------------------------------------------------------------------------
// Linear Search Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onLinearSearchStart(const std::vector<int> &arr, int target) {
    cout << "\n"
         << YELLOW << "Initial Array:" << RESET << "\n";
    printArray(const_cast<int*>(arr.data()), arr.size());
    cout << "Target: " << CYAN << target << RESET << " | Size (sz): " << arr.size() << "\n";
    waitForEnter();
}

void ConsoleObserver::onLinearSearchCheck(const std::vector<int> &arr, int currentIndex, int target, int comparisons) {
    cout << "\nChecking index [" << currentIndex << "] -> Value: " << arr[currentIndex] << "\n";
    printSearchStep(arr.data(), arr.size(), currentIndex, target);
}

void ConsoleObserver::onLinearSearchMatch(const std::vector<int> &arr, int index, int target) {
    cout << GREEN << "--> Element found! Value " << target
         << " located at index " << index << RESET << "\n";
}

void ConsoleObserver::onLinearSearchMismatch(const std::vector<int> &arr, int index, int currentVal, int target) {
    cout << RED << "--> " << currentVal << " != " << target
         << ", advancing cursor..." << RESET << "\n";
}

void ConsoleObserver::onLinearSearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) {
    printHeader("LINEAR SEARCH COMPLETE");
    if (resultIndex != -1)
    {
        cout << GREEN << "Result: Found at index " << resultIndex << RESET << "\n";
    }
    else
    {
        cout << RED << "Result: Element not found in array (-1)" << RESET << "\n";
    }

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Target Searched   : " << target << "\n";
    cout << " Array Size (sz)   : " << arr.size() << "\n";
    cout << " Total Comparisons : " << comparisons << "\n";
    cout << " Returned Index    : " << resultIndex << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(1)", "O(n)", "O(n)", "O(1)");
}

// ----------------------------------------------------------------------------
// Binary Search Console Hooks
// ----------------------------------------------------------------------------
void ConsoleObserver::onBinarySearchStart(const std::vector<int> &arr, int target) {
    cout << "\n"
         << YELLOW << "Search Array:" << RESET << "\n";
    printArray(const_cast<int*>(arr.data()), arr.size());
    cout << "Target: " << CYAN << target << RESET << " | Size: " << arr.size() << "\n";
    waitForEnter();
}

void ConsoleObserver::onBinarySearchStep(const std::vector<int> &arr, int st, int mid, int end, int target, int comparisons) {
    cout << "\n----------------------------------------";
    cout << "\nst = " << st << ", end = " << end << " => mid = " << mid << " (arr[mid] = " << arr[mid] << ")\n";
    printbinarySearchState(arr, st, mid, end, target);
}

void ConsoleObserver::onBinarySearchGreater(const std::vector<int> &arr, int mid, int target, int midVal) {
    cout << YELLOW << "--> tar (" << target << ") > arr[mid] (" << midVal << "): Searching in 2nd half (st = mid + 1)" << RESET << "\n";
}

void ConsoleObserver::onBinarySearchSmaller(const std::vector<int> &arr, int mid, int target, int midVal) {
    cout << BLUE << " --> tar(" << target << ") < arr[mid] (" << midVal << "): Searching in first half( end = mid - 1)" << RESET << "\n";
}

void ConsoleObserver::onBinarySearchMatch(const std::vector<int> &arr, int mid, int target, int midVal) {
    cout << GREEN << " --> tar (" << target << ") == arr[mid] (" << midVal << "): Match found at index " << mid << "!" << RESET << "\n";
}

void ConsoleObserver::onBinarySearchComplete(const std::vector<int> &arr, int target, int resultIndex, int comparisons) {
    printHeader("BINARY SEARCH COMPLETE");
    if (resultIndex != -1)
    {
        cout << GREEN << "Result: Found target at index " << resultIndex << RESET << "\n";
    }
    else
    {
        cout << RED << "Result: Target not found in array (-1)" << RESET << "\n";
    }

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Target (tar)      : " << target << "\n";
    cout << " Array Size        : " << arr.size() << "\n";
    cout << " Total Iterations  : " << comparisons << "\n";
    cout << " Returned Index    : " << resultIndex << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(1)", "O(logn)", "O(logn)", "O(1)");
}
