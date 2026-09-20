#include "utils.h"

#ifdef _WIN32
// If the Windows header doesn't define this flag, define it manually
#ifndef ENABLE_VIRTUAL_TERMINAL_PROCESSING
#define ENABLE_VIRTUAL_TERMINAL_PROCESSING 0x0004
#endif
// ╔══════════════════════════════════════╗
// ║         ENABLE COLORS (WINDOWS)      ║
// ╚══════════════════════════════════════╝
void enableColors()
{
    // Force the terminal output to use UTF-8 character encoding
    SetConsoleOutputCP(CP_UTF8);

    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    DWORD dwMode = 0;
    GetConsoleMode(hOut, &dwMode);
    dwMode |= ENABLE_VIRTUAL_TERMINAL_PROCESSING;
    SetConsoleMode(hOut, dwMode);
}
#else
// ╔══════════════════════════════════════╗
// ║         ENABLE COLORS (LINUX/POSIX)  ║
// ╚══════════════════════════════════════╝
void enableColors()
{
    // Standard Linux/POSIX terminals support UTF-8 and ANSI escape codes natively.
    std::cout.flush();
}
#endif

// ╔══════════════════════════════════════╗
// ║         HELPER FUNCTIONS             ║
// ╚══════════════════════════════════════╝

void printHeader(const string &title)
{
    int width = 30; // Total width of the box
    cout << "\n"
         << CYAN << BOLD;

    // Top border
    cout << "+";
    for (int i = 0; i < width - 2; i++)
        cout << "-";
    cout << "+\n";

    // Centered title content
    int padding = (width - 2 - title.length()) / 2;
    int extraPadding = (width - 2 - title.length()) % 2; // Handles odd lengths cleanly

    cout << "|";
    for (int i = 0; i < padding; i++)
        cout << " ";
    cout << title;
    for (int i = 0; i < padding + extraPadding; i++)
        cout << " ";
    cout << "|\n";

    // Bottom border
    cout << "+";
    for (int i = 0; i < width - 2; i++)
        cout << "-";
    cout << "+\n"
         << RESET;
}

// Print section divider
void printDivider()
{
    cout << GRAY
         << "----------------------------------------"
         << RESET << "\n";
}

// Print pass number
void printPass(int passNum)
{
    cout << MAGENTA << BOLD
         << "\n--- PASS " << passNum << " ----"
         << RESET << "\n";
}

// Printswap message
void printSwap(int a, int b)
{
    cout << RED << BOLD
         << "SWAP!" << a << "<->" << b
         << RESET << "\n";
}

// Print no swap message
void printNoSwap()
{
    cout << GRAY
         << "No Swap needed"
         << RESET << "\n";
}

// Print array normally
void printArray(int arr[], int n)
{
    cout << BLUE << "[";
    for (int i = 0; i < n; i++)
    {
        cout << arr[i];
        if (i < n - 1)
            cout << "  ";
    }
    cout << "]" << RESET << "\n";
}

// Print array with two position highlighted(being compared)
void printArrayHighlight(int arr[], int n, int pos1, int pos2)
{
    cout << "[ ";
    for (int i = 0; i < n; i++)
    {
        if (i == pos1 || i == pos2)
        {
            cout << YELLOW << BOLD
                 << "[" << arr[i] << "]"
                 << RESET;
        }
        else
        {
            cout << BLUE << arr[i] << RESET;
        }
        if (i < n - 1)
            cout << " ";
    }
    cout << "]\n";
}

// Print array with sorted portion highlighted green
void printArraySorted(int arr[], int n, int sortedForm)
{
    cout << " [";
    for (int i = 0; i < n; i++)
    {
        if (i >= sortedForm)
        {
            cout << GREEN << BOLD
                 << arr[i] << RESET;
        }
        else
        {
            cout << BLUE << arr[i] << RESET;
        }
        if (i < n - 1)
            cout << " ";
    }
    cout << "]\n";
}

// Print time and space complexity
void printComplexity(string best, string average, string worst, string space)
{
    cout << "\n";
    printDivider();
    cout << CYAN << BOLD
         << " COMPLEXITY ANALYSIS\n"
         << RESET;
    printDivider();
    cout << CYAN << "Best Case: "
         << WHITE << best << RESET << "\n";
    cout << CYAN << "Average Case: "
         << WHITE << average << RESET << "\n";
    cout << CYAN << "Worst Case: "
         << WHITE << worst << RESET << "\n";
    cout << CYAN << "Space: "
         << WHITE << space << RESET << "\n";
    printDivider();
}

// Print Statistics
void printStats(int comparisons, int swaps, int passes)
{
    cout << "\n";
    printDivider();
    cout << CYAN << BOLD
         << " STATISTICS\n"
         << RESET;
    printDivider();
    cout << MAGENTA << " Total Comparisons: "
         << WHITE << comparisons << RESET << "\n";
    cout << MAGENTA << "Total Swaps: "
         << WHITE << swaps << RESET << "\n";
    cout << MAGENTA << "Total Passes: "
         << WHITE << passes << RESET << "\n";
    printDivider();
}

// Pause for animation effect
void pause(int ms)
{
#ifdef _WIN32
    Sleep(ms);
#else
    struct timespec req;
    req.tv_sec = ms / 1000;
    req.tv_nsec = (ms % 1000) * 1000000L;
    nanosleep(&req, nullptr);
#endif
}

// Wair for user to press Enter(Step Mode)
void waitForEnter()
{
    cout << GRAY
         << " Press Enter for next step..."
         << RESET;
    cin.ignore();
    cin.get();
}

// Get valid integer input
int getValidInt(string prompt, int min, int max)
{
    string input;
    while (true)
    {
        cout << WHITE << prompt << RESET;
        if (!(cin >> input))
        {
            cin.clear();
            cin.ignore(10000, '\n');
            continue;
        }
        try
        {
            int value = stoi(input); // convert text to integer
            if (value >= min && value <= max)
            {
                return value; // Success! Return the valid choice
            }
        }
        catch (...)
        {
            // If user typed letters, ignore it and let the loop repeat
        }
        cout << RED << " Invalid input! Enter number between " << min << " and " << max << RESET << "\n";
    }
}

// Choose mode(Auto or Step)
bool chooseMode()
{
    cout << "\n";
    printDivider();
    cout << CYAN << BOLD
         << " SELECT MODE\n"
         << RESET;
    printDivider();
    cout << GREEN << " 1. Auto Mode "
         << GRAY << "(runs automatically)\n"
         << RESET;
    cout << YELLOW << " 2. Step Mode "
         << GRAY << "(press enter each step)\n"
         << RESET;
    printDivider();
    int choice = getValidInt(" Enter choice(1 or 2): ", 1, 2);
    return (choice == 1);
}
