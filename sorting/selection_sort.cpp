#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

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

    int comparisons = 0;
    int swapsCount = 0;
    int passes = 0;

    cout << "\n"
         << YELLOW << "Initial Array:" << RESET << "\n";
    printArray(arr.data(), n);
    waitForEnter();

    // 2. Selection Sort Visualizer Engine
    for (int i = 0; i < n - 1; i++)
    {
        passes++;
        printPass(passes);
        int minIdx = i;

        cout << CYAN << "Current unsorted boundary starts at index " << i << " (Value: " << arr[i] << ")" << RESET << "\n";

        for (int j = i + 1; j < n; j++)
        {
            comparisons++;
            cout << "\nComparing current min [Index " << minIdx << ": " << arr[minIdx]
                 << "] with target [Index " << j << ": " << arr[j] << "]:\n";
            printArrayHighlight(arr.data(), n, minIdx, j);

            if (arr[j] < arr[minIdx])
            {
                minIdx = j;
                cout << GREEN << "--> New minimum found at index " << minIdx << " (" << arr[minIdx] << ")!" << RESET << "\n";
            }

            if (autoMode)
                pause(800);
            else
                waitForEnter();
        }

        // Swap minimum into position
        if (minIdx != i)
        {
            cout << "\nSwapping index " << i << " (" << arr[i] << ") and minimum index " << minIdx << " (" << arr[minIdx] << "):\n";
            printSwap(arr[i], arr[minIdx]);

            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            swapsCount++;
        }
        else
        {
            cout << "\nElement " << arr[i] << " at index " << i << " is already in correct position.\n";
            printNoSwap();
        }

        cout << "\nEnd of Pass " << passes << ". Sorted array up to index " << i << ":\n";
        printArraySorted(arr.data(), n, i);

        if (autoMode)
            pause(1200);
        else
            waitForEnter();
    }

    // 3. Clean Final Dashboard
    printHeader("SELECTION SORT COMPLETE");
    cout << GREEN << "Final Sorted Array: " << RESET << "\n";
    printArraySorted(arr.data(), n, n - 1);

    printStats(comparisons, swapsCount, passes);
    printComplexity("O(n^2)", "O(n^2)", "O(n^2)", "O(1)");

    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}