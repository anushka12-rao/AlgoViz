#include "../utils.h"
#include <iostream>
#include <string>
#include <limits>

using namespace std;

static const int VISUAL_LIMIT = 6;

class Node
{
public:
    int data;
    Node *next;

    Node(int val)
    {
        data = val;
        next = NULL;
    }
};

class Queue
{
    Node *head; // front
    Node *tail; // rear
    int count;

public:
    Queue()
    {
        head = tail = NULL;
        count = 0;
    }

    ~Queue()
    {
        clear();
    }

    void push(int data)
    {
        Node *newNode = new Node(data);
        if (empty())
        {
            head = tail = newNode;
        }
        else
        {
            tail->next = newNode;
            tail = newNode;
        }
        count++;
    }

    void pop()
    {
        if (empty())
        {
            return;
        }
        Node *temp = head;
        head = head->next;
        if (head == NULL)
        {
            tail = NULL;
        }
        delete temp;
        count--;
    }

    int front() const
    {
        if (empty())
        {
            return -1;
        }
        return head->data;
    }

    bool empty() const
    {
        return head == NULL;
    }

    int size() const
    {
        return count;
    }

    void clear()
    {
        while (!empty())
        {
            pop();
        }
    }

    void render(const string &statusMsg = "") const
    {
        cout << "\n======================================================\n";
        cout << "           QUEUE VISUALIZER (FIFO - LINKED LIST)      \n";
        cout << "======================================================\n\n";

        if (!statusMsg.empty())
        {
            cout << " Status: " << statusMsg << "\n\n";
        }

        if (empty())
        {
            cout << "  head -> NULL\n";
            cout << "  tail -> NULL\n";
            cout << "\n  [ QUEUE IS EMPTY ]\n";
            cout << "\n Current Size: 0 | Front: None | Rear: None\n";
            return;
        }

        int visibleCount = (count <= VISUAL_LIMIT) ? count : VISUAL_LIMIT;

        // Pointer indicators
        cout << "          head";
        if (count > 1)
        {
            int gapSpaces = (count <= VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (VISUAL_LIMIT - 1) * 14 + 2;
            cout << string(gapSpaces, ' ') << "tail";
        }
        cout << "\n";

        // Downward arrows
        cout << "           |  ";
        if (count > 1)
        {
            int gapSpaces = (count <= VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (VISUAL_LIMIT - 1) * 14 + 2;
            cout << string(gapSpaces, ' ') << " |  ";
        }
        cout << "\n";

        cout << "           v  ";
        if (count > 1)
        {
            int gapSpaces = (count <= VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (VISUAL_LIMIT - 1) * 14 + 2;
            cout << string(gapSpaces, ' ') << " v  ";
        }
        cout << "\n";

        // Top borders
        cout << "  ";
        for (int i = 0; i < visibleCount; i++)
        {
            cout << "+--------+    ";
        }
        cout << "\n  ";

        // Cell values
        Node *curr = head;
        for (int i = 0; i < visibleCount; i++)
        {
            string valStr = to_string(curr->data);
            int pad = 6 - static_cast<int>(valStr.length());
            int padL = (pad > 0) ? pad / 2 : 0;
            int padR = (pad > 0) ? pad - padL : 0;

            cout << "| " << string(padL, ' ') << CYAN << valStr << RESET << string(padR, ' ') << " |";
            if (curr->next != NULL && i < visibleCount - 1)
            {
                cout << " -> ";
            }
            else if (curr->next != NULL && i == visibleCount - 1)
            {
                cout << " -> ...";
            }
            else
            {
                cout << " -> NULL";
            }
            curr = curr->next;
        }
        cout << "\n  ";

        // Bottom borders
        for (int i = 0; i < visibleCount; i++)
        {
            cout << "+--------+    ";
        }
        cout << "\n";

        cout << "\n Current Size: " << count
             << " | Front (head): " << head->data
             << " | Rear (tail): " << tail->data << "\n";
    }
};

void queueVisualizer()
{
    Queue q;
    int choice = -1; // Must be int to match case 1, case 2, etc.

    q.render("Queue initialized using Linked List (head & tail).");

    while (choice != 0)
    {
        cout << "\n----------------------------------------\n";
        cout << " QUEUE OPERATIONS\n";
        cout << "----------------------------------------\n";
        cout << " 1. push(val)   - Enqueue (Insert at tail)\n";
        cout << " 2. pop()       - Dequeue (Remove from head)\n";
        cout << " 3. front()     - Inspect front element\n";
        cout << " 4. empty()     - Check if queue is empty\n";
        cout << " 5. Clear Queue\n";
        cout << " 0. Back to Data Structures Menu\n";
        cout << "----------------------------------------\n";
        cout << " Enter choice (0-5): ";

        if (!(cin >> choice))
        {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            continue;
        }

        switch (choice)
        {
        case 1:
        {
            int val;
            cout << "Enter integer to push: ";
            while (!(cin >> val))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }

            q.push(val);
            q.render(string(GREEN) + "push(" + to_string(val) + ") added to tail." + RESET);
            break;
        }
        case 2:
        {
            if (q.empty())
            {
                q.render(string(RED) + "UNDERFLOW! Queue is already empty." + RESET);
                break;
            }
            int removed = q.front();
            q.pop();
            q.render(string(YELLOW) + "pop() removed " + to_string(removed) + " from head." + RESET);
            break;
        }
        case 3:
        {
            if (q.empty())
            {
                q.render(string(YELLOW) + "q.empty() is true. No front element." + RESET);
            }
            else
            {
                q.render(string(CYAN) + "q.front() => " + to_string(q.front()) + RESET);
            }
            break;
        }
        case 4:
        {
            if (q.empty())
                q.render("q.empty() == true (Queue is empty)");
            else
                q.render("q.empty() == false (Size: " + to_string(q.size()) + ")");
            break;
        }
        case 5:
        {
            q.clear();
            q.render("Queue cleared.");
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