#include "quick_sort.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

// Rearrange elements around the pivot using the Lomuto partition scheme (internal linkage)
static int partition(vector<int> &arr, int st, int end, int &comparisons, int &swaps, IAlgoObserver &obs)
{
    int idx = st - 1;
    int pivot = arr[end];

    obs.onQuickPartitionStart(arr, st, end, pivot, end);

    // Scan through the subarray and place elements smaller than or equal to pivot on the left
    for (int j = st; j < end; j++)
    {
        comparisons++;
        obs.onQuickComparePivot(arr, j, end, arr[j], pivot, comparisons);

        if (arr[j] <= pivot)
        {
            idx++;
            int valJ = arr[j];
            int valIdx = arr[idx];

            if (idx != j)
            {
                swap(arr[j], arr[idx]);
                swaps++;
                obs.onQuickSwap(arr, idx, j, valIdx, valJ, pivot, comparisons, swaps);
            }
            else
            {
                obs.onQuickSameIndex(arr, idx, valIdx, pivot);
            }
        }
        else
        {
            obs.onQuickGreater(arr, j, end, arr[j], pivot);
        }

        obs.onPause(700);
    }

    // Place pivot at its final sorted boundary index
    idx++;
    swap(arr[end], arr[idx]);
    swaps++;

    obs.onQuickPivotPlaced(arr, idx, end, pivot, st, end, swaps);
    obs.onPause(900);

    return idx;
}

// Recursive divide-and-conquer function for quicksort (internal linkage)
static void quickSort(vector<int> &arr, int st, int end, int &comparisons, int &swaps, IAlgoObserver &obs)
{
    if (st < end)
    {
        int pivIdx = partition(arr, st, end, comparisons, swaps, obs);

        obs.onQuickSubparts(arr, pivIdx, st, end);
        obs.onPause(600);

        // Recursively sort elements before and after partition
        quickSort(arr, st, pivIdx - 1, comparisons, swaps, obs);
        quickSort(arr, pivIdx + 1, end, comparisons, swaps, obs);
    }
}

// Core algorithmic execution decoupled from terminal I/O
void quickSortCore(vector<int> &arr, IAlgoObserver &obs, bool autoMode)
{
    int comparisons = 0;
    int swaps = 0;

    obs.onInitial(arr);

    if (arr.size() > 1)
    {
        quickSort(arr, 0, arr.size() - 1, comparisons, swaps, obs);
    }

    obs.onQuickComplete(arr, comparisons, swaps);
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

    ConsoleObserver obs(autoMode);
    quickSortCore(arr, obs, autoMode);

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}