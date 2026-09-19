#include "linear_search.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

// Sequential search through the array to find target element
int linearSearchCore(const vector<int> &arr, int target, IAlgoObserver &obs, bool autoMode)
{
    int sz = arr.size();
    obs.onLinearSearchStart(arr, target);

    int comparisons = 0;
    for (int i = 0; i < sz; i++)
    {
        comparisons++;
        obs.onLinearSearchCheck(arr, i, target, comparisons);

        // Target match condition: element exists in array
        if (arr[i] == target)
        {
            obs.onLinearSearchMatch(arr, i, target);
            obs.onPause(700);
            obs.onLinearSearchComplete(arr, target, i, comparisons);
            return i; // Return 0-based index of matched target
        }

        obs.onLinearSearchMismatch(arr, i, arr[i], target);
        obs.onPause(700);
    }

    // Unsuccessful search: target does not exist within array bounds
    obs.onLinearSearchComplete(arr, target, -1, comparisons);
    return -1;
}

// User-facing visualizer coordinator
void linearSearchVisualizer()
{
    bool autoMode = chooseMode();

    int sz;
    cout << "\nEnter size of array (sz: 1-15): ";
    while (!(cin >> sz) || sz < 1 || sz > 15)
    {
        cout << "Invalid size! Enter between 1 and 15: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    vector<int> arr(sz);
    cout << "Enter " << sz << " elements separated by space:\n";
    for (int i = 0; i < sz; i++)
    {
        while (!(cin >> arr[i]))
        {
            cout << "Invalid element! Enter integers only: ";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }

    int target;
    cout << "Enter target to search for: ";
    while (!(cin >> target))
    {
        cout << "Invalid input! Enter an integer: ";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    ConsoleObserver obs(autoMode);
    linearSearchCore(arr, target, obs, autoMode);

    cout << "\nPress Enter to return to the menu...";
    cin.get();
}