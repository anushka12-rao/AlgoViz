#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;
void insertionSortVisualizer()
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
    int shiftsCount = 0;
    int passes = 0;

    cout << "\n"
         << YELLOW << "Initial Array: " << RESET << "\n";
    printArray(arr.data(), n);
    waitForEnter();

    // 2. Insertion Sort Visualizer Engine
    for (int i = 1; i < n; i++)
    {
        passes++;
        printPass(passes);

        int key = arr[i];
        int j = i - 1;

        cout << CYAN << "Inserting Key = " << key << "(from index " << i << ") into sorted subarray [0..." << i - 1 << "]" << RESET << "\n";

        while (j >= 0)
        {
            comparisons++;

            cout << "\nComparing key (" << key << ") with element at index " << j << "(" << arr[j] << "):\n";
            printArrayHighlight(arr.data(), n, j, j + 1);

            if (arr[j] > key)
            {
                cout << YELLOW << "--> " << arr[j] << " > " << key
                     << " , shifting " << arr[j] << " right to index " << (j + 1) << RESET << "\n";
                arr[j + 1] = arr[j];
                shiftsCount++;
                j--;
            }
            else
            {
                cout << GREEN << "-->" << arr[j] << " <= " << key
                     << ",correct insertion position found!" << RESET << "\n";
                break;
            }

            if (autoMode)
                pause(800);
            else
                waitForEnter();
        }

        arr[j + 1] = key;
        cout << "\nPlaced key (" << key << ") at index " << (j + 1) << ".\n";
        cout << "\nEnd of pass " << passes << ". Sorted array up to index " << i << ":\n";
        printArraySorted(arr.data(), n, i);

        if (autoMode)
            pause(1200);
        else
            waitForEnter();
    }
    // 3. Clean Final Dashboard
    printHeader(" INSERTION SORT COMPLETE");
    cout << GREEN << "Final Sorted Array:" << RESET << "\n";
    printArraySorted(arr.data(), n, n - 1);
    printStats(comparisons, shiftsCount, passes);
    printComplexity("O(n)", "O(n^2)", "O(n^2)", "O(1)");
    cout << "\nPress Enter to return to the main menu...";
    cin.get();
}