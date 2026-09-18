#include "insertion_sort.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

void insertionSortCore(vector<int> &arr, IAlgoObserver &obs, bool autoMode)
{
    int n = arr.size();
    int comparisons = 0;
    int shiftsCount = 0;
    int passes = 0;

    obs.onInitial(arr);

    // Insertion Sort Engine
    for (int i = 1; i < n; i++)
    {
        passes++;
        obs.onPassStart(passes, arr);

        int key = arr[i];
        int j = i - 1;

        obs.onInsertionKeyExtracted(arr, i, key);

        while (j >= 0)
        {
            comparisons++;
            obs.onInsertionCompare(arr, j, j + 1, key, arr[j], comparisons);

            if (arr[j] > key)
            {
                obs.onInsertionShift(arr, j, j + 1, arr[j], key, shiftsCount);
                arr[j + 1] = arr[j];
                shiftsCount++;
                j--;
            }
            else
            {
                obs.onInsertionFoundPosition(arr, j, key, arr[j]);
                break;
            }

            obs.onPause(800);
        }

        arr[j + 1] = key;
        obs.onInsertionPlacedKey(arr, j + 1, key);

        obs.onInsertionPassEnd(arr, passes, i, comparisons, shiftsCount);

        obs.onPause(1200);
    }

    obs.onInsertionComplete(arr, comparisons, shiftsCount, passes);
}

void insertionSortVisualizer()
{
    bool autoMode = chooseMode();

    // 1. Dynamic User Input Setup
    int n;
    cout << "\nEnter number of elements(1-15): ";
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
    insertionSortCore(arr, obs, autoMode);

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}