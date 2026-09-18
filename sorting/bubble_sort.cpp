#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>
using namespace std;

void bubbleSortVisualizer()
{
    // 1. Initialize the dashboard mode selection
    bool autoMode = chooseMode();

    // 2. Dynamic User Input Setup
    int n;
    cout << "\n Enter number of elements(1-15): ";
    while (!(cin >> n) || n < 1 || n > 15)
    {
        cout << "Invalid size! Enter between 1 and 15: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
    vector<int> arr(n);
    cout << " Enter " << n << " elements separated by space:\n";
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i]; // Populates array cleanly
    }

    // Tracker variables for runtime statistics
    int comparisons = 0;
    int swapsCount = 0;
    int passes = 0;

    cout << "\n"
         << YELLOW << "Initial Array:" << RESET << "\n";
    printArray(arr.data(), n);
    waitForEnter();

    // 3. Core Visualized Animation Loop
    for (int i = 0; i < n - 1; i++)
    {
        passes++;
        printPass(passes);
        bool swapped = false;

        for (int j = 0; j < n - i - 1; j++)
        {
            comparisons++;

            // Highlight the two elements currently being compared
            cout << "\nComparing indices " << j << " and " << j + 1 << ":\n";
            printArrayHighlight(arr.data(), n, j, j + 1);

            if (arr[j] > arr[j + 1])
            {
                // Perform swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;

                swapped = true;
                swapsCount++;

                printSwap(arr[j + 1], arr[j]); // Show swap notification
            }
            else
            {
                printNoSwap();
            }

            // Pacing control based on user's mode preference
            if (autoMode)
            {
                pause(800);
            }
            else
            {
                waitForEnter();
            }
        }

        cout << "\nEnd of Pass " << passes << ". Current array status:\n";
        printArraySorted(arr.data(), n, n - i - 1);

        if (autoMode)
            pause(1200);
        else
            waitForEnter();

        // Optimized escape condition: if no swaps occurred, array is already sorted
        if (!swapped)
        {
            cout << GREEN << "\nOptimized Check: No swaps occurred. Array is fully sorted early!" << RESET << "\n";
            break;
        }
    }

    // 4. Final Analytics Summary Dashboard
    printHeader("SORTING COMPLETE");
    cout << GREEN << "Final Sorted Array:" << RESET << "\n";
    printArraySorted(arr.data(), n, 0);
    printStats(comparisons, swapsCount, passes);
    printComplexity("O(n)", "O(n^2)", "O(n^2)", "O(1)");
    cout << "\n Press Enter to return to menu...";
    cin.get();
}