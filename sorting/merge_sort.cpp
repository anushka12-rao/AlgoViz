#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

// Print a specific subarray range[st..end]
static void printSubarray(const vector<int> &arr, int st, int end)
{
    cout << "[";
    for (int i = st; i <= end; i++)
    {
        cout << arr[i] << " ";
    }
    cout << "]\n";
}

// Two-pointer merge routine to combine two subarrays into one
static void merge(vector<int> &arr, int st, int mid, int end, int &comparisons, int &mergesCount, bool autoMode)
{
    vector<int> temp;
    int i = st;
    int j = mid + 1;

    cout << "\n"
         << CYAN << "---Merging Subarrays---" << RESET << "\n";
    cout << "Left half [" << st << "..." << mid << "]:";
    printSubarray(arr, st, mid);
    cout << "Right half[" << mid + 1 << "..." << end << "]:";
    printSubarray(arr, mid + 1, end);

    // Compare elements from both halves and store the smaller one in temp
    while (i <= mid && j <= end)
    {
        comparisons++;
        cout << "Comparing Left (" << arr[i] << ") and Right (" << arr[j] << "):\n";
        printArrayHighlight(arr.data(), arr.size(), i, j);

        if (arr[i] <= arr[j])
        {
            cout << GREEN << "--> " << arr[i] << "<= " << arr[j]
                 << ", adding " << arr[i] << " to temp " << RESET << "\n";
            temp.push_back(arr[i]);
            i++;
        }
        else
        {
            cout << GREEN << "--> " << arr[j] << " < " << arr[i]
                 << ", adding " << arr[j] << " to temp " << RESET << "\n";
            temp.push_back(arr[j]);
            j++;
        }

        if (autoMode)
            pause(800);
        else
            waitForEnter();
    }

    // Append remaining elements from the left subarray,if any
    while (i <= mid)
    {
        cout << YELLOW << "--> Copying remaining Left element " << arr[i] << " to temp " << RESET << "\n";
        temp.push_back(arr[i]);
        i++;
        if (autoMode)
            pause(400);
        else
            waitForEnter();
    }

    // Append remaining elements from the right subarray , if any
    while (j <= end)
    {
        cout << YELLOW << "--> Copying remaining Right element " << arr[j] << " to temp " << RESET << "\n";
        temp.push_back(arr[j]);
        j++;
        if (autoMode)
            pause(400);
        else
            waitForEnter();
    }

    // Copy sorted elements  from temp back into the original array
    for (int idx = 0; idx < temp.size(); idx++)
    {
        arr[st + idx] = temp[idx];
    }

    mergesCount++;
    cout << "\nMerged section [" << st << "..." << end << "]:";
    printSubarray(arr, st, end);
    cout << " Current Full Array:\n";
    printArray(arr.data(), arr.size());

    if (autoMode)
        pause(1000);
    else
        waitForEnter();
}

// Recursive divide-and-Conquer function
static void mergeSort(vector<int> &arr, int st, int end,
                      int &comparisons, int &mergesCount, bool autoMode)
{
    if (st < end)
    {
        int mid = st + (end - st) / 2;

        cout << "\n"
             << MAGENTA << " Splitting range [" << st << "..." << end
             << "] at mid = " << mid << RESET << "\n";
        cout << " Left half:  [" << st << "..." << mid << "]\n";
        cout << " Right half: [" << mid + 1 << "..." << end << "]\n";

        if (autoMode)
            pause(600);
        else
            waitForEnter();

        mergeSort(arr, st, mid, comparisons, mergesCount, autoMode);
        mergeSort(arr, mid + 1, end, comparisons, mergesCount, autoMode);

        merge(arr, st, mid, end, comparisons, mergesCount, autoMode);
    }
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

    int comparisons = 0;
    int mergesCount = 0;

    cout << "\n"
         << YELLOW << "Initial Array: " << RESET << "\n";
    printArray(arr.data(), n);
    waitForEnter();

    // 2.Start Recursive  Merge Sort
    mergeSort(arr, 0, n - 1, comparisons, mergesCount, autoMode);

    // 3.Display Resluts Dashboard
    printHeader("MERGE SORT COMPLETE");
    cout << GREEN << "Final Sorted Array: " << RESET << "\n";
    printArray(arr.data(), n);

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Total Comparisons : " << comparisons << "\n";
    cout << " Total Merge Steps : " << mergesCount << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(nlogn)", "O(nlogn)", "O(nlogn)", "O(n)");

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}
