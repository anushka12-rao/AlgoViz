#include "stack.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <limits>

using namespace std;

Stack::Stack(IAlgoObserver *obs) : observer(obs) {
    // Reserve memory upfront to avoid dynamic reallocations
    v.reserve(STACK_MAX_CAPACITY);
}

void Stack::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* Stack::getObserver() const {
    return observer;
}

bool Stack::push(int val) {
    if (v.size() >= STACK_MAX_CAPACITY) {
        if (observer) {
            observer->onStackOverflow(v);
        }
        return false;
    }
    v.push_back(val);
    if (observer) {
        observer->onStackPush(v, val, static_cast<int>(v.size()) - 1);
    }
    return true;
}

bool Stack::pop() {
    int dummy;
    return pop(dummy);
}

bool Stack::pop(int &poppedVal) {
    if (v.empty()) {
        if (observer) {
            observer->onStackUnderflow(v);
        }
        return false;
    }
    poppedVal = v.back();
    v.pop_back();
    if (observer) {
        observer->onStackPop(v, poppedVal);
    }
    return true;
}

int Stack::top() const {
    if (empty()) {
        return -1;
    }
    return v.back();
}

void Stack::notifyTop() {
    if (empty()) {
        if (observer) {
            observer->onStackTop(v, -1, -1, true);
        }
    } else {
        if (observer) {
            observer->onStackTop(v, v.back(), static_cast<int>(v.size()) - 1, false);
        }
    }
}

bool Stack::empty() const {
    return v.empty();
}

void Stack::notifyEmptyCheck() {
    if (observer) {
        observer->onStackEmptyCheck(v, v.empty());
    }
}

int Stack::size() const {
    return static_cast<int>(v.size());
}

void Stack::clear() {
    v.clear();
    if (observer) {
        observer->onStackClear(v);
    }
}

void Stack::notifyInit() {
    if (observer) {
        observer->onStackInit(v);
    }
}

const vector<int>& Stack::getElements() const {
    return v;
}

// Main visualizer loop integrated with AlgoViz
void stackVisualizer()
{
    ConsoleObserver obs(true);
    Stack s(&obs);
    int choice = -1;

    s.notifyInit();

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
            if (s.size() >= STACK_MAX_CAPACITY)
            {
                s.push(0); // triggers onStackOverflow
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
            break;
        }
        case 2:
        {
            if (s.empty())
            {
                int dummy;
                s.pop(dummy); // triggers onStackUnderflow
                break;
            }
            int poppedVal;
            s.pop(poppedVal);
            break;
        }
        case 3:
        {
            s.notifyTop();
            break;
        }
        case 4:
        {
            s.notifyEmptyCheck();
            break;
        }
        case 5:
        {
            s.clear();
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