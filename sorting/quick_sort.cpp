#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

// Print a specific subarray range [st...end]
static void printSubarray(const vector<int> &arr, int st, int end)
{
    cout << "[";
    for (int i = st; i <= end; i++)
    {
        cout << arr[i] << " ";
    }
    cout << "]\n";
}

// Rearrange elements around the pivot using the Lomuto partition scheme
static int partition(vector<int> &arr, int st, int end, int &comparisons, int &swaps, bool autoMode)
{
    int idx = st - 1;
    int pivot = arr[end];

    cout << "\n"
         << CYAN << "--- Partitioning Range [" << st << "..." << end << "] ---" << RESET << "\n";
    cout << "Subarray: ";
    printSubarray(arr, st, end);
    cout << "Selected Pivot: " << YELLOW << pivot << RESET << " (at index " << end << ")\n";

    // Scan through the subarray and place elements smaller than or equal to pivot on the left
    for (int j = st; j < end; j++)
    {
        comparisons++;
        cout << "\nComparing arr[" << j << "] (" << arr[j] << ") with Pivot (" << pivot << "):\n";
        printArrayHighlight(arr.data(), arr.size(), j, end);

        if (arr[j] <= pivot)
        {
            idx++;
            cout << GREEN << " --> " << arr[j] << " <= " << pivot
                 << ", swapping arr[" << j << "] (" << arr[j]
                 << ") with arr[" << idx << "] (" << arr[idx] << ")" << RESET << "\n";

            if (idx != j)
            {
                swap(arr[j], arr[idx]);
                swaps++;
                cout << "Array after swap:\n";
                printArrayHighlight(arr.data(), arr.size(), idx, j);
            }
            else
            {
                cout << "Elements are at same index (" << idx << "), no move needed.\n";
            }
        }
        else
        {
            cout << RED << "--> " << arr[j] << " > " << pivot
                 << ", leaving on the right side" << RESET << "\n";
        }

        if (autoMode)
            pause(700);
        else
            waitForEnter();
    }

    // Place pivot at its final sorted boundary index
    idx++;
    cout << "\n"
         << MAGENTA << "Placing pivot (" << pivot << ") at correct index " << idx << RESET << "\n";
    swap(arr[end], arr[idx]);
    swaps++;

    cout << " Array after pivot placement:\n";
    printArrayHighlight(arr.data(), arr.size(), idx, end);
    cout << " Subarray now: ";
    printSubarray(arr, st, end);

    if (autoMode)
        pause(900);
    else
        waitForEnter();

    return idx;
}

// Recursive divide-and-conquer function for quicksort
static void quickSort(vector<int> &arr, int st, int end, int &comparisons, int &swaps, bool autoMode)
{
    if (st < end)
    {
        int pivIdx = partition(arr, st, end, comparisons, swaps, autoMode);

        cout << "\nPivot " << arr[pivIdx] << " is fixed at index " << pivIdx << ".\n";
        cout << "Left partition to sort: [" << st << "..." << pivIdx - 1 << "]\n";
        cout << "Right partition to sort: [" << pivIdx + 1 << "..." << end << "]\n";

        if (autoMode)
            pause(600);
        else
            waitForEnter();

        // Recursively sort elements before and after partition
        quickSort(arr, st, pivIdx - 1, comparisons, swaps, autoMode);
        quickSort(arr, pivIdx + 1, end, comparisons, swaps, autoMode);
    }
}

// Primary execution function for quick sort visualizer
void quickSortVisualizer()
{
    bool autoMode = chooseMode();

    // 1.Dynamic User Input Setup
    int n;
    cout << "\nEnter number of elements(1-15): ";
    while (!(cin >> n) || n < 1 || n > 15)
    {
        cout << "Invalid size! Enter between 1 and 15: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    vector<int> arr(n);
    cout << "Enter " << n << " elements separated by space: \n";
    for (int i = 0; i < n; i++)
    {
        while (!(cin >> arr[i]))
        {
            cout << "Invalid element! Enter integers only: ";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }

    int comparisons = 0;
    int swaps = 0;

    cout << "\n"
         << YELLOW << "Initial Array:" << RESET << "\n";
    printArray(arr.data(), n);
    waitForEnter();

    // 2.Start Recursive Quick Sort
    quickSort(arr, 0, n - 1, comparisons, swaps, autoMode);

    // 3.Display Results Dashboard
    printHeader("QUICK SORT COMPLETE");
    cout << GREEN << "Final Sorted Array:" << RESET << "\n";
    printArray(arr.data(), n);

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Total Comparisons : " << comparisons << "\n";
    cout << " Total Swaps       : " << swaps << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(nlogn)", "O(nlogn)", "O(n^2)", "O(logn)");

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}