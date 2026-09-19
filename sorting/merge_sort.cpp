#include "merge_sort.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

// Two-pointer merge routine to combine two subarrays into one (internal linkage)
static void merge(vector<int> &arr, int st, int mid, int end, int &comparisons, int &mergesCount, IAlgoObserver &obs)
{
    vector<int> temp;
    int i = st;
    int j = mid + 1;

    obs.onMergeStart(arr, st, mid, end);

    // Compare elements from both halves and store the smaller one in temp
    while (i <= mid && j <= end)
    {
        comparisons++;
        bool leftChosen = (arr[i] <= arr[j]);
        obs.onMergeCompare(arr, i, j, arr[i], arr[j], leftChosen, comparisons);

        if (leftChosen)
        {
            temp.push_back(arr[i]);
            i++;
        }
        else
        {
            temp.push_back(arr[j]);
            j++;
        }

        obs.onPause(800);
    }

    // Append remaining elements from the left subarray,if any
    while (i <= mid)
    {
        obs.onMergeCopyRemaining(arr, i, arr[i], true);
        temp.push_back(arr[i]);
        i++;
        obs.onPause(400);
    }

    // Append remaining elements from the right subarray , if any
    while (j <= end)
    {
        obs.onMergeCopyRemaining(arr, j, arr[j], false);
        temp.push_back(arr[j]);
        j++;
        obs.onPause(400);
    }

    // Copy sorted elements  from temp back into the original array
    for (size_t idx = 0; idx < temp.size(); idx++)
    {
        arr[st + idx] = temp[idx];
    }

    mergesCount++;
    obs.onMergeSectionEnd(arr, st, end, mergesCount);
    obs.onPause(1000);
}

// Recursive divide-and-Conquer function (internal linkage)
static void mergeSort(vector<int> &arr, int st, int end,
                      int &comparisons, int &mergesCount, IAlgoObserver &obs)
{
    if (st < end)
    {
        int mid = st + (end - st) / 2;

        obs.onMergeSplit(arr, st, mid, end);
        obs.onPause(600);

        mergeSort(arr, st, mid, comparisons, mergesCount, obs);
        mergeSort(arr, mid + 1, end, comparisons, mergesCount, obs);

        merge(arr, st, mid, end, comparisons, mergesCount, obs);
    }
}

// Core algorithmic execution decoupled from terminal I/O
void mergeSortCore(vector<int> &arr, IAlgoObserver &obs, bool autoMode)
{
    int comparisons = 0;
    int mergesCount = 0;

    obs.onInitial(arr);

    if (arr.size() > 1)
    {
        mergeSort(arr, 0, arr.size() - 1, comparisons, mergesCount, obs);
    }

    obs.onMergeComplete(arr, comparisons, mergesCount);
}

// Primary execution function for merge sort visualizer
void mergeSortVisualizer()
{
    bool autoMode = chooseMode();

    // 1.Dynamic User Input Setup
    int n;
    cout << "\nEnter number of elements (1-15): ";
    while (!(cin >> n) || n < 1 || n > 15)
    {
        cout << "Invalid size! Enter between 1 and 15: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    vector<int> arr(n);
    cout << "Enter " << n << " elements separated by space:\n";
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
    mergeSortCore(arr, obs, autoMode);

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}
