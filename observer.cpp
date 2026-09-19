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

// ----------------------------------------------------------------------------
// Stack Visualizer Helpers & Hooks
// ----------------------------------------------------------------------------
static const int OBS_STACK_MAX_CAPACITY = 7;

void ConsoleObserver::renderStack(const std::vector<int> &v, int highlightIndex, const std::string &statusMsg) const {
    cout << "\n========================================\n";
    cout << "           STACK VISUALIZER (LIFO)      \n";
    cout << "========================================\n\n";

    if (!statusMsg.empty())
    {
        cout << " Status: " << statusMsg << "\n\n";
    }

    if (v.empty())
    {
        cout << "       |          |\n";
        cout << "       |  (EMPTY) |\n";
        cout << "       +----------+\n";
        cout << "        STACK BASE \n";
        cout << "\n Size: 0 / " << OBS_STACK_MAX_CAPACITY << " | Top Index: -1\n";
        return;
    }

    // Render remaining empty headroom slots
    for (int i = OBS_STACK_MAX_CAPACITY - 1; i >= static_cast<int>(v.size()); i--)
    {
        cout << "       |          |\n";
    }

    // Render stored vector elements from top (v.size() - 1) down to index 0
    for (int i = static_cast<int>(v.size()) - 1; i >= 0; i--)
    {
        bool isTop = (i == static_cast<int>(v.size()) - 1);
        bool isHighlighted = (i == highlightIndex);

        if (isTop)
            cout << " top-> ";
        else
            cout << "       ";

        cout << "+----------+\n";
        cout << "       |";

        // Format cell interior to exact 10-character box width
        string valStr = "[" + to_string(v[i]) + "]";
        int padLeft = (10 - static_cast<int>(valStr.length())) / 2;
        int padRight = 10 - static_cast<int>(valStr.length()) - padLeft;

        cout << string(padLeft, ' ');
        if (isHighlighted)
            cout << GREEN << valStr << RESET;
        else if (isTop)
            cout << CYAN << valStr << RESET;
        else
            cout << valStr;
        cout << string(padRight, ' ') << "|\n";
    }

    cout << "       +----------+\n";
    cout << "        STACK BASE \n";
    cout << "\n Current Size: " << v.size() << " / " << OBS_STACK_MAX_CAPACITY
         << " | Top Index: " << static_cast<int>(v.size()) - 1 << "\n";
}

void ConsoleObserver::onStackInit(const std::vector<int> &elements) {
    renderStack(elements, -1, "Stack initialized using vector<int> v.");
}

void ConsoleObserver::onStackPush(const std::vector<int> &elements, int val, int highlightIdx) {
    renderStack(elements, highlightIdx, string(GREEN) + "push(" + to_string(val) + ") complete." + RESET);
}

void ConsoleObserver::onStackOverflow(const std::vector<int> &elements) {
    renderStack(elements, -1, string(RED) + "OVERFLOW! Cannot push beyond MAX_CAPACITY." + RESET);
}

void ConsoleObserver::onStackPop(const std::vector<int> &elements, int poppedVal) {
    renderStack(elements, -1, string(YELLOW) + "pop() removed " + to_string(poppedVal) + RESET);
}

void ConsoleObserver::onStackUnderflow(const std::vector<int> &elements) {
    renderStack(elements, -1, string(RED) + "UNDERFLOW! Cannot pop from empty stack." + RESET);
}

void ConsoleObserver::onStackTop(const std::vector<int> &elements, int topVal, int highlightIdx, bool empty) {
    if (empty) {
        renderStack(elements, -1, string(YELLOW) + "s.empty() is true. No top element." + RESET);
    } else {
        renderStack(elements, highlightIdx, string(CYAN) + "s.top() => " + to_string(topVal) + RESET);
    }
}

void ConsoleObserver::onStackEmptyCheck(const std::vector<int> &elements, bool isEmpty) {
    if (isEmpty)
        renderStack(elements, -1, "s.empty() == true (Stack is empty)");
    else
        renderStack(elements, -1, "s.empty() == false (Size: " + to_string(elements.size()) + ")");
}

void ConsoleObserver::onStackClear(const std::vector<int> &elements) {
    renderStack(elements, -1, "Stack cleared.");
}

// ----------------------------------------------------------------------------
// Queue Visualizer Helpers & Hooks
// ----------------------------------------------------------------------------
static const int OBS_QUEUE_VISUAL_LIMIT = 6;

void ConsoleObserver::renderQueue(const std::vector<int> &v, const std::string &statusMsg) const {
    cout << "\n======================================================\n";
    cout << "           QUEUE VISUALIZER (FIFO - LINKED LIST)      \n";
    cout << "======================================================\n\n";

    if (!statusMsg.empty())
    {
        cout << " Status: " << statusMsg << "\n\n";
    }

    int count = static_cast<int>(v.size());

    if (count == 0)
    {
        cout << "  head -> NULL\n";
        cout << "  tail -> NULL\n";
        cout << "\n  [ QUEUE IS EMPTY ]\n";
        cout << "\n Current Size: 0 | Front: None | Rear: None\n";
        return;
    }

    int visibleCount = (count <= OBS_QUEUE_VISUAL_LIMIT) ? count : OBS_QUEUE_VISUAL_LIMIT;

    // Pointer indicators
    cout << "          head";
    if (count > 1)
    {
        int gapSpaces = (count <= OBS_QUEUE_VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (OBS_QUEUE_VISUAL_LIMIT - 1) * 14 + 2;
        cout << string(gapSpaces, ' ') << "tail";
    }
    cout << "\n";

    // Downward arrows
    cout << "           |  ";
    if (count > 1)
    {
        int gapSpaces = (count <= OBS_QUEUE_VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (OBS_QUEUE_VISUAL_LIMIT - 1) * 14 + 2;
        cout << string(gapSpaces, ' ') << " |  ";
    }
    cout << "\n";

    cout << "           v  ";
    if (count > 1)
    {
        int gapSpaces = (count <= OBS_QUEUE_VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (OBS_QUEUE_VISUAL_LIMIT - 1) * 14 + 2;
        cout << string(gapSpaces, ' ') << " v  ";
    }
    cout << "\n";

    // Top borders
    cout << "  ";
    for (int i = 0; i < visibleCount; i++)
    {
        cout << "+--------+    ";
    }
    cout << "\n  ";

    // Cell values
    for (int i = 0; i < visibleCount; i++)
    {
        string valStr = to_string(v[i]);
        int pad = 6 - static_cast<int>(valStr.length());
        int padL = (pad > 0) ? pad / 2 : 0;
        int padR = (pad > 0) ? pad - padL : 0;

        cout << "| " << string(padL, ' ') << CYAN << valStr << RESET << string(padR, ' ') << " |";
        if (i < count - 1 && i < visibleCount - 1)
        {
            cout << " -> ";
        }
        else if (i < count - 1 && i == visibleCount - 1)
        {
            cout << " -> ...";
        }
        else
        {
            cout << " -> NULL";
        }
    }
    cout << "\n  ";

    // Bottom borders
    for (int i = 0; i < visibleCount; i++)
    {
        cout << "+--------+    ";
    }
    cout << "\n";

    cout << "\n Current Size: " << count
         << " | Front (head): " << v[0]
         << " | Rear (tail): " << v.back() << "\n";
}

void ConsoleObserver::onQueueInit(const std::vector<int> &elements) {
    renderQueue(elements, "Queue initialized using Linked List (head & tail).");
}

void ConsoleObserver::onQueuePush(const std::vector<int> &elements, int val) {
    renderQueue(elements, string(GREEN) + "push(" + to_string(val) + ") added to tail." + RESET);
}

void ConsoleObserver::onQueuePop(const std::vector<int> &elements, int removedVal) {
    renderQueue(elements, string(YELLOW) + "pop() removed " + to_string(removedVal) + " from head." + RESET);
}

void ConsoleObserver::onQueueUnderflow(const std::vector<int> &elements) {
    renderQueue(elements, string(RED) + "UNDERFLOW! Queue is already empty." + RESET);
}

void ConsoleObserver::onQueueFront(const std::vector<int> &elements, int frontVal, bool empty) {
    if (empty) {
        renderQueue(elements, string(YELLOW) + "q.empty() is true. No front element." + RESET);
    } else {
        renderQueue(elements, string(CYAN) + "q.front() => " + to_string(frontVal) + RESET);
    }
}

void ConsoleObserver::onQueueEmptyCheck(const std::vector<int> &elements, bool isEmpty) {
    if (isEmpty)
        renderQueue(elements, "q.empty() == true (Queue is empty)");
    else
        renderQueue(elements, "q.empty() == false (Size: " + to_string(elements.size()) + ")");
}

void ConsoleObserver::onQueueClear(const std::vector<int> &elements) {
    renderQueue(elements, "Queue cleared.");
}

// ----------------------------------------------------------------------------
// Linked List Visualizer Helpers & Hooks
// ----------------------------------------------------------------------------
static const int OBS_LIST_VISUAL_LIMIT = 6;

void ConsoleObserver::renderList(const std::vector<int> &v, int highlightIdx, const std::string &statusMsg) const {
    cout << "\n======================================================\n";
    cout << "         SINGLY LINKED LIST VISUALIZER                \n";
    cout << "======================================================\n\n";

    if (!statusMsg.empty())
    {
        cout << " Status: " << statusMsg << "\n\n";
    }

    int count = static_cast<int>(v.size());

    if (count == 0)
    {
        cout << "  head -> NULL\n";
        cout << "  tail -> NULL\n";
        cout << "\n  [ LIST IS EMPTY ]\n";
        cout << "\n Size: 0 | Head: None | Tail: None\n";
        return;
    }

    int visibleCount = (count <= OBS_LIST_VISUAL_LIMIT) ? count : OBS_LIST_VISUAL_LIMIT;

    // Pointer tags line
    cout << "          head";
    if (count > 1)
    {
        int gapSpaces = (count <= OBS_LIST_VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (OBS_LIST_VISUAL_LIMIT - 1) * 14 + 2;
        cout << string(gapSpaces, ' ') << "tail";
    }
    cout << "\n";

    // Vertical arrow bars
    cout << "           |  ";
    if (count > 1)
    {
        int gapSpaces = (count <= OBS_LIST_VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (OBS_LIST_VISUAL_LIMIT - 1) * 14 + 2;
        cout << string(gapSpaces, ' ') << " |  ";
    }
    cout << "\n";

    // Arrow heads
    cout << "           v  ";
    if (count > 1)
    {
        int gapSpaces = (count <= OBS_LIST_VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (OBS_LIST_VISUAL_LIMIT - 1) * 14 + 2;
        cout << string(gapSpaces, ' ') << " v  ";
    }
    cout << "\n";

    // Top node borders
    cout << "  ";
    for (int i = 0; i < visibleCount; i++)
    {
        cout << "+--------+    ";
    }
    cout << "\n  ";

    // Node values and arrows
    for (int i = 0; i < visibleCount; i++)
    {
        string valStr = to_string(v[i]);
        int pad = 6 - static_cast<int>(valStr.length());
        int padL = (pad > 0) ? pad / 2 : 0;
        int padR = (pad > 0) ? pad - padL : 0;

        cout << "| " << string(padL, ' ');
        if (i == highlightIdx)
        {
            cout << GREEN << valStr << RESET;
        }
        else
        {
            cout << CYAN << valStr << RESET;
        }
        cout << string(padR, ' ') << " |";

        if (i < count - 1 && i < visibleCount - 1)
        {
            cout << " -> ";
        }
        else if (i < count - 1 && i == visibleCount - 1)
        {
            cout << " -> ...";
        }
        else
        {
            cout << " -> NULL";
        }
    }
    cout << "\n  ";

    // Bottom node borders
    for (int i = 0; i < visibleCount; i++)
    {
        cout << "+--------+    ";
    }
    cout << "\n  ";

    // 0-based indices under each node
    for (int i = 0; i < visibleCount; i++)
    {
        string idxStr = "idx:" + to_string(i);
        int pad = 8 - static_cast<int>(idxStr.length());
        int padL = (pad > 0) ? pad / 2 : 0;
        int padR = (pad > 0) ? pad - padL : 0;
        cout << " " << string(padL, ' ') << idxStr << string(padR, ' ') << "     ";
    }
    cout << "\n";

    cout << "\n Current Size: " << count
         << " | Head: " << v[0]
         << " | Tail: " << v.back() << "\n";
}

void ConsoleObserver::onListInit(const std::vector<int> &elements) {
    renderList(elements, -1, "Linked List initialized (head & tail).");
}

void ConsoleObserver::onListPushFront(const std::vector<int> &elements, int val, int highlightIdx) {
    renderList(elements, highlightIdx, string(GREEN) + "push_front(" + to_string(val) + ") completed." + RESET);
}

void ConsoleObserver::onListPushBack(const std::vector<int> &elements, int val, int highlightIdx) {
    renderList(elements, highlightIdx, string(GREEN) + "push_back(" + to_string(val) + ") completed." + RESET);
}

void ConsoleObserver::onListPopFront(const std::vector<int> &elements, int removedVal) {
    renderList(elements, -1, string(YELLOW) + "pop_front() removed head node." + RESET);
}

void ConsoleObserver::onListPopBack(const std::vector<int> &elements, int removedVal) {
    renderList(elements, -1, string(YELLOW) + "pop_back() removed tail node." + RESET);
}

void ConsoleObserver::onListUnderflow(const std::vector<int> &elements, const std::string &op) {
    renderList(elements, -1, string(RED) + "UNDERFLOW! List is empty." + RESET);
}

void ConsoleObserver::onListSearch(const std::vector<int> &elements, int key, int foundIdx, bool wasEmpty) {
    if (wasEmpty) {
        renderList(elements, -1, string(YELLOW) + "List is empty. Cannot search." + RESET);
    } else if (foundIdx != -1) {
        renderList(elements, foundIdx, string(GREEN) + "Found " + to_string(key) + " at index " + to_string(foundIdx) + RESET);
    } else {
        renderList(elements, -1, string(RED) + "Element " + to_string(key) + " not found in list." + RESET);
    }
}

void ConsoleObserver::onListClear(const std::vector<int> &elements) {
    renderList(elements, -1, "List cleared.");
}

// ----------------------------------------------------------------------------
// Tree Visualizer Helpers & Hooks
// ----------------------------------------------------------------------------

static int computeTreeHeightHelper(const std::vector<TreeNodeRecord> &tree, int nodeIdx) {
    if (nodeIdx < 0 || nodeIdx >= static_cast<int>(tree.size()))
        return 0;
    int leftH = (tree[nodeIdx].left_id != -1) ? computeTreeHeightHelper(tree, tree[nodeIdx].left_id) : 0;
    int rightH = (tree[nodeIdx].right_id != -1) ? computeTreeHeightHelper(tree, tree[nodeIdx].right_id) : 0;
    return 1 + std::max(leftH, rightH);
}

static void printBSTInorderHelper(const std::vector<TreeNodeRecord> &tree, int nodeIdx) {
    if (nodeIdx < 0 || nodeIdx >= static_cast<int>(tree.size()))
        return;
    if (tree[nodeIdx].left_id != -1) {
        printBSTInorderHelper(tree, tree[nodeIdx].left_id);
    }
    std::cout << CYAN << "[" << tree[nodeIdx].val << "] " << RESET;
    if (tree[nodeIdx].right_id != -1) {
        printBSTInorderHelper(tree, tree[nodeIdx].right_id);
    }
}

void ConsoleObserver::renderTreeBranches(const std::vector<TreeNodeRecord> &tree, int nodeIdx, const std::string &prefix, bool isLeft) const {
    if (nodeIdx < 0 || nodeIdx >= static_cast<int>(tree.size()))
        return;

    const auto &node = tree[nodeIdx];
    std::cout << prefix;
    std::cout << (isLeft ? "+-- " : "\\-- ");
    std::cout << CYAN << "[" << node.val << "]" << RESET << "\n";

    if (node.left_id != -1)
        renderTreeBranches(tree, node.left_id, prefix + (isLeft ? "|   " : "    "), true);
    if (node.right_id != -1)
        renderTreeBranches(tree, node.right_id, prefix + (isLeft ? "|   " : "    "), false);
}

void ConsoleObserver::renderBinaryTree(const std::vector<TreeNodeRecord> &tree, const std::string &statusMsg) const {
    std::cout << "\n======================================================\n";
    std::cout << "            BINARY TREE VISUALIZER                   \n";
    std::cout << "======================================================\n\n";

    if (!statusMsg.empty())
    {
        std::cout << " Status: " << statusMsg << "\n\n";
    }

    if (tree.empty())
    {
        std::cout << "  root -> NULL\n";
        std::cout << "\n  [ TREE IS EMPTY ]\n";
        return;
    }

    std::cout << " Tree Hierarchy:\n\n";
    std::cout << " root\n";
    renderTreeBranches(tree, 0, " ", false);
    std::cout << "\n Total Nodes: " << tree.size()
              << " | Height: " << computeTreeHeightHelper(tree, 0) << "\n";
}

void ConsoleObserver::renderBST(const std::vector<TreeNodeRecord> &tree, const std::string &statusMsg) const {
    std::cout << "\n======================================================\n";
    std::cout << "       BINARY SEARCH TREE (BST) VISUALIZER           \n";
    std::cout << "======================================================\n\n";

    if (!statusMsg.empty())
    {
        std::cout << " Status: " << statusMsg << "\n\n";
    }

    if (tree.empty())
    {
        std::cout << "  root -> NULL\n";
        std::cout << "\n  [ BST IS EMPTY ]\n";
        return;
    }

    std::cout << " Tree Structure:\n\n";
    std::cout << " root\n";
    renderTreeBranches(tree, 0, " ", false);

    std::cout << "\n Total Nodes: " << tree.size() << "\n";
    std::cout << "  Sorted Values (Inorder): ";
    printBSTInorderHelper(tree, 0);
    std::cout << "\n";
}

// Binary Tree Callbacks
void ConsoleObserver::onBinaryTreeInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    renderBinaryTree(tree, msg);
}

void ConsoleObserver::onBinaryTreeInsert(const std::vector<TreeNodeRecord> &tree, int parentVal, int newVal, char side, bool success, const std::string &msg) {
    (void)parentVal;
    (void)newVal;
    (void)side;
    (void)success;
    renderBinaryTree(tree, msg);
}

void ConsoleObserver::onBinaryTreeBuildPreorder(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &preorder, bool success, const std::string &msg) {
    (void)preorder;
    (void)success;
    renderBinaryTree(tree, msg);
}

void ConsoleObserver::onBinaryTreeTraversal(const std::vector<TreeNodeRecord> &tree, const std::string &traversalType, const std::vector<int> &result, bool empty) {
    if (empty) {
        renderBinaryTree(tree, std::string(YELLOW) + "Tree is empty. Insert data first." + RESET);
        return;
    }
    renderBinaryTree(tree, "");
    if (traversalType == "inorder") {
        std::cout << "\n Inorder Traversal (Left -> Root -> Right):\n ";
    } else if (traversalType == "preorder") {
        std::cout << "\n Preorder Traversal (Root -> Left -> Right):\n ";
    } else if (traversalType == "postorder") {
        std::cout << "\n Postorder Traversal (Left -> Right -> Root):\n ";
    }
    for (int v : result) {
        std::cout << CYAN << "[" << v << "] " << RESET;
    }
    std::cout << "\n";
}

void ConsoleObserver::onBinaryTreeLevelOrder(const std::vector<TreeNodeRecord> &tree, const std::vector<std::vector<int>> &levels, bool empty) {
    if (empty) {
        renderBinaryTree(tree, std::string(YELLOW) + "Tree is empty. Insert data first." + RESET);
        return;
    }
    renderBinaryTree(tree, "");
    std::cout << "\n Level Order Traversal (BFS):\n";
    for (size_t i = 0; i < levels.size(); i++) {
        std::cout << "   Level " << i << ": ";
        for (int v : levels[i]) {
            std::cout << CYAN << "[" << v << "] " << RESET;
        }
        std::cout << "\n";
    }
}

void ConsoleObserver::onBinaryTreeMetrics(const std::vector<TreeNodeRecord> &tree, int count, int height, int sum, bool empty) {
    if (empty) {
        renderBinaryTree(tree, std::string(YELLOW) + "Tree is empty. Insert data first." + RESET);
        return;
    }
    renderBinaryTree(tree, "");
    std::cout << "\n Tree Metrics:\n";
    std::cout << "  - Total Nodes : " << count << "\n";
    std::cout << "  - Tree Height : " << height << "\n";
    std::cout << "  - Sum of Nodes: " << sum << "\n";
}

void ConsoleObserver::onBinaryTreeClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    renderBinaryTree(tree, msg);
}

// BST Callbacks
void ConsoleObserver::onBSTInit(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    renderBST(tree, msg);
}

void ConsoleObserver::onBSTInsertBatch(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &inputValues, int addedCount, int duplicateCount, const std::vector<int> &sortedValues, const std::string &msg) {
    (void)inputValues;
    (void)addedCount;
    (void)duplicateCount;
    (void)sortedValues;
    renderBST(tree, msg);
}

void ConsoleObserver::onBSTSearch(const std::vector<TreeNodeRecord> &tree, int target, bool found, const std::vector<std::string> &path, const std::vector<int> &sortedValues, const std::string &msg) {
    (void)target;
    (void)found;
    (void)path;
    (void)sortedValues;
    renderBST(tree, msg);
}

void ConsoleObserver::onBSTDelete(const std::vector<TreeNodeRecord> &tree, int val, bool deleted, const std::vector<int> &sortedValues, const std::string &msg) {
    (void)val;
    (void)deleted;
    (void)sortedValues;
    renderBST(tree, msg);
}

void ConsoleObserver::onBSTSorted(const std::vector<TreeNodeRecord> &tree, const std::vector<int> &sortedValues, bool empty) {
    (void)sortedValues;
    (void)empty;
    renderBST(tree, "");
}

void ConsoleObserver::onBSTClear(const std::vector<TreeNodeRecord> &tree, const std::string &msg) {
    renderBST(tree, msg);
}
