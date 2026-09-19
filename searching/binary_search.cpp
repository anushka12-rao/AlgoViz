#include "binary_search.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <limits>
#include <iomanip>

using namespace std;

// Iterative binary search implementation on a sorted array
int binarySearchCore(const vector<int> &arr, int tar, IAlgoObserver &obs, bool autoMode)
{
    obs.onBinarySearchStart(arr, tar);

    int st = 0, end = (int)arr.size() - 1;
    int comparisons = 0;

    // Continue searching while the search window is valid
    while (st <= end)
    {
        comparisons++;
        // Calculate midpoint using overflow-safe arithmetic
        int mid = st + (end - st) / 2;

        obs.onBinarySearchStep(arr, st, mid, end, tar, comparisons);

        // Case 1.Target is greater than midpoint value; search in 2nd half
        if (tar > arr[mid])
        {
            obs.onBinarySearchGreater(arr, mid, tar, arr[mid]);
            st = mid + 1; // 2nd half
        }
        // Case 2: Target is smaller than midpoint value; search in 1st half
        else if (tar < arr[mid])
        {
            obs.onBinarySearchSmaller(arr, mid, tar, arr[mid]);
            end = mid - 1; // 1st half
        }
        // Case 3: Target matches mid point element
        else
        {
            obs.onBinarySearchMatch(arr, mid, tar, arr[mid]);
            obs.onPause(800);
            obs.onBinarySearchComplete(arr, tar, mid, comparisons);
            return mid; // Return 0- based index of matched target
        }

        obs.onPause(800);
    }

    // Target does not exist in the collection
    obs.onBinarySearchComplete(arr, tar, -1, comparisons);
    return -1;
}

// Visualizer coordinator for the terminal interface
void binarySearchVisualizer()
{
    bool autoMode = chooseMode();

    int n;
    cout << "\nEnter number of elements (1-15): ";
    while (!(cin >> n) || n < 1 || n > 15)
    {
        cout << "Invalid size! Enter number between 1 and 15: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    // Allocate array and accept user input
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
    // Binary search requires a sorted array
    if (!is_sorted(arr.begin(), arr.end()))
    {
        cout << YELLOW << "\nNote: Binary Search requires a sorted array. Array- sorting elements..." << RESET << "\n";
        sort(arr.begin(), arr.end());
    }

    int tar;
    cout << "Enter target (tar) to search for: ";
    while (!(cin >> tar))
    {
        cout << "Invalid inout! Enter an interger: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    ConsoleObserver obs(autoMode);
    binarySearchCore(arr, tar, obs, autoMode);

    cout << "\nPress Enter to return to the menu...";
    cin.get();
}
