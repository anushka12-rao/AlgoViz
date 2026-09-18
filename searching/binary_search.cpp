#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <limits>
#include <iomanip>

using namespace std;

// Render current search boundaries and pointer markers
static void printbinarySearchState(const vector<int> &arr, int st, int mid, int end, int tar)
{
    int n = arr.size();

    cout << "\nIndex: ";
    for (int i = 0; i < n; i++)
    {
        cout << setw(6) << i;
    }

    cout << "\nArray: ";
    for (int i = 0; i < n; i++)
    {
        if (i == mid)
        {
            string val = "[" + to_string(arr[i]) + "]";
            if (arr[i] == tar)
                cout << GREEN << setw(6) << val << RESET;
            else
                cout << YELLOW << setw(6) << val << RESET;
        }
        else if (i >= st && i <= end)
        {
            cout << CYAN << setw(6) << arr[i] << RESET;
        }
        else
        {
            cout << GRAY << setw(6) << arr[i] << RESET;
        }
    }
    cout << "\nPtrs : ";
    for (int i = 0; i < n; i++)
    {
        string ptr = "";
        if (i == st)
            ptr += "st";
        if (i == mid)
            ptr += (ptr.empty() ? "" : "/") + string("mid");
        if (i == end)
            ptr += (ptr.empty() ? "" : "/") + string("end");
        cout << setw(6) << (ptr.empty() ? " " : ptr);
    }
    cout << "\n";
}

// Iterative binary search implementation on a sorted array
int binarySearch(vector<int> arr, int tar, int &comparisons, bool autoMode)
{ // Iterative
    int st = 0, end = arr.size() - 1;

    // Continue searching while the search window is valid
    while (st <= end)
    {
        comparisons++;
        // Calculate midpoint using overflow-safe arithmetic
        int mid = st + (end - st) / 2;

        cout << "\n----------------------------------------";
        cout << "\nst = " << st << ", end = " << end << " => mid = " << mid << " (arr[mid] = " << arr[mid] << ")\n";
        printbinarySearchState(arr, st, mid, end, tar);

        // Case 1.Target is greater than midpoint value; search in 2nd half
        if (tar > arr[mid])
        {
            cout << YELLOW << "--> tar (" << tar << ") > arr[mid] (" << arr[mid] << "): Searching in 2nd half (st = mid + 1)" << RESET << "\n";
            st = mid + 1; // 2nd half
        }
        // Case 2: Target is smaller than midpoint value; search in 1st half
        else if (tar < arr[mid])
        {
            cout << BLUE << " --> tar(" << tar << ") < arr[mid] (" << arr[mid] << "): Searching in first half( end = mid - 1)" << RESET << "\n";
            end = mid - 1; // 1st half
        }
        // Case 3: Target matches mid point element
        else
        {
            cout << GREEN << " --> tar (" << tar << ") == arr[mid] (" << arr[mid] << "): Match found at index " << mid << "!" << RESET << "\n";
            if (autoMode)
                pause(800);
            else
                waitForEnter();
            return mid; // Return 0- based index of matched target
        }

        if (autoMode)
            pause(800);
        else
            waitForEnter();
    }

    // Target does not exist in the collection
    return -1;
}
// Visualizer coordiantor for the terminal interface
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

    cout << "\n"
         << YELLOW << "Search Array:" << RESET << "\n";
    printArray(arr.data(), n);
    cout << "Target: " << CYAN << tar << RESET << " | Size: " << n << "\n";
    waitForEnter();

    int comparisons = 0;
    int ans = binarySearch(arr, tar, comparisons, autoMode);

    // Result Dashboard
    printHeader("BINARY SEARCH COMPLETE");
    if (ans != -1)
    {
        cout << GREEN << "Result: Found target at index " << ans << RESET << "\n";
    }
    else
    {
        cout << RED << "Result: Target not found in array (-1)" << RESET << "\n";
    }

    cout << "\n----------------------------------------\n";
    cout << " STATISTICS\n";
    cout << "----------------------------------------\n";
    cout << " Target (tar)      : " << tar << "\n";
    cout << " Array Size        : " << n << "\n";
    cout << " Total Iterations  : " << comparisons << "\n";
    cout << " Returned Index    : " << ans << "\n";
    cout << "----------------------------------------\n";

    printComplexity("O(1)", "O(logn)", "O(logn)", "O(1)");
    cout << "\nPress Enter to return to the menu...";

    cin.get();
}
