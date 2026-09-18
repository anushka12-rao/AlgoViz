#include "../utils.h"
#include <iostream>
#include <vector>
#include <limits>

using namespace std;

// Highlight array traversal: visually marks the active comparison index
static void printSearchStep(int arr[], int sz, int currentIndex, int target)
{
    cout << "[ ";
    for (int i = 0; i < sz; i++)
    {
        if (i == currentIndex)
        {
            if (arr[i] == target)
            {
                cout << GREEN << "[" << arr[i] << "]" << RESET << " ";
            }
            else
            {
                cout << YELLOW << "[" << arr[i] << "]" << RESET << " ";
            }
        }
        else
        {
            cout << arr[i] << " ";
        }
    }
    cout << "]\n";
}

// Sequential search through the array to find target element
int linearSearch(int arr[], int sz, int target, int &comparisons, bool autoMode)
{
    for (int i = 0; i < sz; i++)
    {
        comparisons++;
        cout << "\nChecking index [" << i << "] -> Value: " << arr[i] << "\n";
        printSearchStep(arr, sz, i, target);

        // Target match condition: element exists in array
        if (arr[i] == target)
        {
            cout << GREEN << "--> Element found! Value " << target
                 << " located at index " << i << RESET << "\n";
            if (autoMode)
                pause(700);
            else
                waitForEnter();
            return i; // Return 0-based index of matched target
        }

        cout << RED << "--> " << arr[i] << " != " << target
             << ", advancing cursor..." << RESET << "\n";
        if (autoMode)
            pause(700);
        else
            waitForEnter();
    }

    // Unsuccessful search: target does not exist within array bounds
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

    cout << "\n"
         << YELLOW << "Initial Array:" << RESET << "\n";
    printArray(arr.data(), sz);
    cout << "Target: " << CYAN << target << RESET << " | Size (sz): " << sz << "\n";
    waitForEnter();

    int comparisons = 0;
    int ans = linearSearch(arr.data(), sz, target, comparisons, autoMode);

    // Results Dashboard
    printHeader("LINEAR SEARCH COMPLETE");
    if (ans != -1)
    {
        cout << GREEN << "Result: Found at index " << ans << RESET << "\n";
    }
    else
    {
        cout << RED << "Result: Element not found in array (-1)" << RESET << "\n";
    }

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Target Searched   : " << target << "\n";
    cout << " Array Size (sz)   : " << sz << "\n";
    cout << " Total Comparisons : " << comparisons << "\n";
    cout << " Returned Index    : " << ans << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(1)", "O(n)", "O(n)", "O(1)");

    cout << "\nPress Enter to return to the menu...";
    cin.get();
}