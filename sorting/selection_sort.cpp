#include "selection_sort.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

void selectionSortCore(vector<int> &arr, IAlgoObserver &obs, bool autoMode)
{
    int n = arr.size();
    int comparisons = 0;
    int swapsCount = 0;
    int passes = 0;

    obs.onInitial(arr);

    // Selection Sort Engine
    for (int i = 0; i < n - 1; i++)
    {
        passes++;
        obs.onPassStart(passes, arr);
        int minIdx = i;

        obs.onSelectionBoundary(arr, i, arr[i]);

        for (int j = i + 1; j < n; j++)
        {
            comparisons++;
            obs.onSelectionCompare(arr, minIdx, j, arr[minIdx], arr[j], comparisons);

            if (arr[j] < arr[minIdx])
            {
                minIdx = j;
                obs.onSelectionNewMin(arr, minIdx, arr[minIdx]);
            }

            obs.onPause(800);
        }

        // Swap minimum into position
        if (minIdx != i)
        {
            obs.onSelectionPreSwap(arr, i, minIdx, arr[i], arr[minIdx]);

            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            swapsCount++;
        }
        else
        {
            obs.onSelectionNoSwap(arr, i, arr[i]);
        }

        obs.onSelectionPassEnd(arr, passes, i, comparisons, swapsCount);

        obs.onPause(1200);
    }

    obs.onSelectionComplete(arr, comparisons, swapsCount, passes);
}

void selectionSortVisualizer()
{
    bool autoMode = chooseMode();

    // 1. Dynamic User Input Setup
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

    // Flush remaining newline from keyboard buffer
    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    ConsoleObserver obs(autoMode);
    selectionSortCore(arr, obs, autoMode);

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}