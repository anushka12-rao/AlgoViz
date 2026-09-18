#include "../utils.h"
#include <iostream>
#include <string>
#include <limits>

using namespace std;

static const int VISUAL_LIMIT = 6;

// Node definition matching reference
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

// Singly Linked List class matching reference terminology
class List
{
    Node *head;
    Node *tail;
    int count; // O(1) size tracking

public:
    List()
    {
        head = tail = NULL;
        count = 0;
    }

    ~List()
    {
        clear();
    }

    // O(1) - Insert at beginning
    void push_front(int val)
    {
        Node *newNode = new Node(val);
        if (head == NULL)
        {
            head = tail = newNode;
        }
        else
        {
            newNode->next = head;
            head = newNode;
        }
        count++;
    }

    // O(1) - Insert at end
    void push_back(int val)
    {
        Node *newNode = new Node(val);
        if (head == NULL)
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

    // O(1) - Delete from beginning
    void pop_front()
    {
        if (head == NULL)
        {
            return;
        }
        Node *temp = head;
        head = head->next;
        temp->next = NULL;
        delete temp;
        count--;
        if (head == NULL)
        {
            tail = NULL;
        }
    }

    // O(N) - Delete from end
    void pop_back()
    {
        if (head == NULL)
        {
            return;
        }
        if (head == tail)
        {
            delete head;
            head = tail = NULL;
            count = 0;
            return;
        }

        Node *temp = head;
        while (temp->next != tail)
        {
            temp = temp->next;
        }

        temp->next = NULL;
        delete tail;
        tail = temp;
        count--;
    }

    // O(N) - Linear search returning 0-based index (-1 if not found)
    int search(int key) const
    {
        Node *temp = head;
        int idx = 0;
        while (temp != NULL)
        {
            if (temp->data == key)
            {
                return idx;
            }
            temp = temp->next;
            idx++;
        }
        return -1;
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
        while (head != NULL)
        {
            pop_front();
        }
    }

    // Terminal ASCII Renderer
    void render(int highlightIdx = -1, const string &statusMsg = "") const
    {
        cout << "\n======================================================\n";
        cout << "         SINGLY LINKED LIST VISUALIZER                \n";
        cout << "======================================================\n\n";

        if (!statusMsg.empty())
        {
            cout << " Status: " << statusMsg << "\n\n";
        }

        if (empty())
        {
            cout << "  head -> NULL\n";
            cout << "  tail -> NULL\n";
            cout << "\n  [ LIST IS EMPTY ]\n";
            cout << "\n Size: 0 | Head: None | Tail: None\n";
            return;
        }

        int visibleCount = (count <= VISUAL_LIMIT) ? count : VISUAL_LIMIT;

        // Pointer tags line
        cout << "          head";
        if (count > 1)
        {
            int gapSpaces = (count <= VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (VISUAL_LIMIT - 1) * 14 + 2;
            cout << string(gapSpaces, ' ') << "tail";
        }
        cout << "\n";

        // Vertical arrow bars
        cout << "           |  ";
        if (count > 1)
        {
            int gapSpaces = (count <= VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (VISUAL_LIMIT - 1) * 14 + 2;
            cout << string(gapSpaces, ' ') << " |  ";
        }
        cout << "\n";

        // Arrow heads
        cout << "           v  ";
        if (count > 1)
        {
            int gapSpaces = (count <= VISUAL_LIMIT) ? (count - 2) * 14 + 10 : (VISUAL_LIMIT - 1) * 14 + 2;
            cout << string(gapSpaces, ' ') << " v  ";
        }
        cout << "\n";

        // Top node borders
        cout << "  ";
        for (int i = 0; i < visibleCount; i++)
        {
            cout << "+--------+    ";
        }
        cout << "\n  ";

        // Node values and arrows
        Node *curr = head;
        for (int i = 0; i < visibleCount; i++)
        {
            string valStr = to_string(curr->data);
            int pad = 6 - static_cast<int>(valStr.length());
            int padL = (pad > 0) ? pad / 2 : 0;
            int padR = (pad > 0) ? pad - padL : 0;

            cout << "| " << string(padL, ' ');
            if (i == highlightIdx)
            {
                cout << GREEN << valStr << RESET;
            }
            else
            {
                cout << CYAN << valStr << RESET;
            }
            cout << string(padR, ' ') << " |";

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

        // Bottom node borders
        for (int i = 0; i < visibleCount; i++)
        {
            cout << "+--------+    ";
        }
        cout << "\n  ";

        // 0-based indices under each node
        for (int i = 0; i < visibleCount; i++)
        {
            string idxStr = "idx:" + to_string(i);
            int pad = 8 - static_cast<int>(idxStr.length());
            int padL = (pad > 0) ? pad / 2 : 0;
            int padR = (pad > 0) ? pad - padL : 0;
            cout << " " << string(padL, ' ') << idxStr << string(padR, ' ') << "     ";
        }
        cout << "\n";

        cout << "\n Current Size: " << count
             << " | Head: " << head->data
             << " | Tail: " << tail->data << "\n";
    }
};

// Coordinator loop for AlgoViz
void linkedListVisualizer()
{
    List l;
    int choice = -1;

    l.render(-1, "Linked List initialized (head & tail).");

    while (choice != 0)
    {
        cout << "\n----------------------------------------\n";
        cout << " LINKED LIST OPERATIONS\n";
        cout << "----------------------------------------\n";
        cout << " 1. push_front(val) - Insert at head\n";
        cout << " 2. push_back(val)  - Insert at tail\n";
        cout << " 3. pop_front()     - Remove from head\n";
        cout << " 4. pop_back()      - Remove from tail\n";
        cout << " 5. search(key)     - Find element index\n";
        cout << " 6. Clear List\n";
        cout << " 0. Back to Data Structures Menu\n";
        cout << "----------------------------------------\n";
        cout << " Enter choice (0-6): ";

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
            int val;
            cout << "Enter integer to insert at head: ";
            while (!(cin >> val))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            l.push_front(val);
            l.render(0, string(GREEN) + "push_front(" + to_string(val) + ") completed." + RESET);
            break;
        }
        case 2:
        {
            int val;
            cout << "Enter integer to insert at tail: ";
            while (!(cin >> val))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            l.push_back(val);
            l.render(l.size() - 1, string(GREEN) + "push_back(" + to_string(val) + ") completed." + RESET);
            break;
        }
        case 3:
        {
            if (l.empty())
            {
                l.render(-1, string(RED) + "UNDERFLOW! List is empty." + RESET);
                break;
            }
            l.pop_front();
            l.render(-1, string(YELLOW) + "pop_front() removed head node." + RESET);
            break;
        }
        case 4:
        {
            if (l.empty())
            {
                l.render(-1, string(RED) + "UNDERFLOW! List is empty." + RESET);
                break;
            }
            l.pop_back();
            l.render(-1, string(YELLOW) + "pop_back() removed tail node." + RESET);
            break;
        }
        case 5:
        {
            if (l.empty())
            {
                l.render(-1, string(YELLOW) + "List is empty. Cannot search." + RESET);
                break;
            }
            int key;
            cout << "Enter integer to search: ";
            while (!(cin >> key))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            int idx = l.search(key);
            if (idx != -1)
            {
                l.render(idx, string(GREEN) + "Found " + to_string(key) + " at index " + to_string(idx) + RESET);
            }
            else
            {
                l.render(-1, string(RED) + "Element " + to_string(key) + " not found in list." + RESET);
            }
            break;
        }
        case 6:
        {
            l.clear();
            l.render(-1, "List cleared.");
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