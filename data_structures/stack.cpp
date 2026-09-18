#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <limits>

using namespace std;

static const int MAX_CAPACITY = 7;

class Stack
{
    vector<int> v;

public:
    Stack()
    {
        // Reserve memory upfront to avoid dynamic reallocations
        v.reserve(MAX_CAPACITY);
    }

    // O(1) - Push element
    void push(int val)
    {
        v.push_back(val);
    }

    // O(1) - Pop element
    void pop()
    {
        if (!empty())
        {
            v.pop_back();
        }
    }

    // O(1) - Peek top element
    int top() const
    {
        if (empty())
            return -1;
        return v[v.size() - 1];
    }

    // O(1) - Check if empty
    bool empty() const
    {
        return v.empty();
    }

    // O(1) - Current size
    int size() const
    {
        return static_cast<int>(v.size());
    }

    // O(1) - Reset stack
    void clear()
    {
        v.clear();
    }

    // Visual ASCII rendering
    void render(int highlightIndex = -1, const string &statusMsg = "") const
    {
        cout << "\n========================================\n";
        cout << "           STACK VISUALIZER (LIFO)      \n";
        cout << "========================================\n\n";

        if (!statusMsg.empty())
        {
            cout << " Status: " << statusMsg << "\n\n";
        }

        if (v.empty())
        {
            cout << "       |          |\n";
            cout << "       |  (EMPTY) |\n";
            cout << "       +----------+\n";
            cout << "        STACK BASE \n";
            cout << "\n Size: 0 / " << MAX_CAPACITY << " | Top Index: -1\n";
            return;
        }

        // Render remaining empty headroom slots
        for (int i = MAX_CAPACITY - 1; i >= static_cast<int>(v.size()); i--)
        {
            cout << "       |          |\n";
        }

        // Render stored vector elements from top (v.size() - 1) down to index 0
        for (int i = static_cast<int>(v.size()) - 1; i >= 0; i--)
        {
            bool isTop = (i == static_cast<int>(v.size()) - 1);
            bool isHighlighted = (i == highlightIndex);

            if (isTop)
                cout << " top-> ";
            else
                cout << "       ";

            cout << "+----------+\n";
            cout << "       |";

            // Format cell interior to exact 10-character box width
            string valStr = "[" + to_string(v[i]) + "]";
            int padLeft = (10 - static_cast<int>(valStr.length())) / 2;
            int padRight = 10 - static_cast<int>(valStr.length()) - padLeft;

            cout << string(padLeft, ' ');
            if (isHighlighted)
                cout << GREEN << valStr << RESET;
            else if (isTop)
                cout << CYAN << valStr << RESET;
            else
                cout << valStr;
            cout << string(padRight, ' ') << "|\n";
        }

        cout << "       +----------+\n";
        cout << "        STACK BASE \n";
        cout << "\n Current Size: " << v.size() << " / " << MAX_CAPACITY
             << " | Top Index: " << static_cast<int>(v.size()) - 1 << "\n";
    }
};

// Main visualizer loop integrated with AlgoViz
void stackVisualizer()
{
    Stack s;
    int choice = -1;

    s.render(-1, "Stack initialized using vector<int> v.");

    while (choice != 0)
    {
        cout << "\n----------------------------------------\n";
        cout << " STACK OPERATIONS\n";
        cout << "----------------------------------------\n";
        cout << " 1. push(val)   - Insert element\n";
        cout << " 2. pop()       - Remove top element\n";
        cout << " 3. top()       - Inspect top element\n";
        cout << " 4. empty()     - Check if stack is empty\n";
        cout << " 5. Clear Stack\n";
        cout << " 0. Back to Main Menu\n";
        cout << "----------------------------------------\n";
        cout << " Enter choice (0-5): ";

        if (!(cin >> choice))
        {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            continue;
        }

        cin.ignore(numeric_limits<streamsize>::max(), '\n');

        switch (choice)
        {
        case 1:
        {
            if (s.size() >= MAX_CAPACITY)
            {
                s.render(-1, string(RED) + "OVERFLOW! Cannot push beyond MAX_CAPACITY." + RESET);
                break;
            }
            int val;
            cout << "Enter integer to push: ";
            while (!(cin >> val))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }

            // Flush extra tokens from the input buffer to prevent cascading menu inputs
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            s.push(val);
            s.render(s.size() - 1, string(GREEN) + "push(" + to_string(val) + ") complete." + RESET);
            break;
        }
        case 2:
        {
            if (s.empty())
            {
                s.render(-1, string(RED) + "UNDERFLOW! Cannot pop from empty stack." + RESET);
                break;
            }
            int poppedVal = s.top();
            s.pop();
            s.render(-1, string(YELLOW) + "pop() removed " + to_string(poppedVal) + RESET);
            break;
        }
        case 3:
        {
            if (s.empty())
            {
                s.render(-1, string(YELLOW) + "s.empty() is true. No top element." + RESET);
            }
            else
            {
                s.render(s.size() - 1, string(CYAN) + "s.top() => " + to_string(s.top()) + RESET);
            }
            break;
        }
        case 4:
        {
            if (s.empty())
                s.render(-1, "s.empty() == true (Stack is empty)");
            else
                s.render(-1, "s.empty() == false (Size: " + to_string(s.size()) + ")");
            break;
        }
        case 5:
        {
            s.clear();
            s.render(-1, "Stack cleared.");
            break;
        }
        case 0:
            cout << "\nReturning to Data Structures menu...\n";
            break;
        default:
            cout << "Invalid choice! Try again.\n";
            break;
        }
    }
}