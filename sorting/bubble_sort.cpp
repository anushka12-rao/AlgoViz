#include "bubble_sort.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>
using namespace std;

void bubbleSortCore(vector<int> &arr, IAlgoObserver &obs, bool autoMode)
{
    int n = arr.size();
    int comparisons = 0;
    int swapsCount = 0;
    int passes = 0;

    obs.onInitial(arr);

    // Core Visualized Animation Loop
    for (int i = 0; i < n - 1; i++)
    {
        passes++;
        obs.onPassStart(passes, arr);
        bool swapped = false;

        for (int j = 0; j < n - i - 1; j++)
        {
            comparisons++;

            // Highlight the two elements currently being compared
            obs.onBubbleCompare(arr, j, j + 1, comparisons, swapsCount, passes);

            if (arr[j] > arr[j + 1])
            {
                // Perform swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;

                swapped = true;
                swapsCount++;

                obs.onBubbleSwap(arr, j, j + 1, arr[j + 1], arr[j], comparisons, swapsCount, passes);
            }
            else
            {
                obs.onBubbleNoSwap(arr, j, j + 1, comparisons, swapsCount, passes);
            }

            // Pacing control based on user's mode preference (800ms)
            obs.onPause(800);
        }

        obs.onBubblePassEnd(arr, passes, n - i - 1, comparisons, swapsCount);

        obs.onPause(1200);

        // Optimized escape condition: if no swaps occurred, array is already sorted
        if (!swapped)
        {
            obs.onEarlyExit(arr, passes, comparisons, swapsCount);
            break;
        }
    }

    obs.onBubbleComplete(arr, comparisons, swapsCount, passes);
}

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

    // Flush keyboard buffer before entering visualizer
    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    ConsoleObserver obs(autoMode);
    bubbleSortCore(arr, obs, autoMode);

    cout << "\n Press Enter to return to menu...";
    cin.get();
}