#include "linked_list.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <limits>

using namespace std;

List::List(IAlgoObserver *obs) : head(nullptr), tail(nullptr), count(0), observer(obs) {}

List::~List() {
    while (head != nullptr) {
        Node *temp = head;
        head = head->next;
        temp->next = nullptr;
        delete temp;
    }
    tail = nullptr;
    count = 0;
}

void List::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* List::getObserver() const {
    return observer;
}

void List::push_front(int val) {
    Node *newNode = new Node(val);
    if (head == nullptr) {
        head = tail = newNode;
    } else {
        newNode->next = head;
        head = newNode;
    }
    count++;
    if (observer) {
        observer->onListPushFront(toVector(), val, 0);
    }
}

void List::push_back(int val) {
    Node *newNode = new Node(val);
    if (head == nullptr) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        tail = newNode;
    }
    count++;
    if (observer) {
        observer->onListPushBack(toVector(), val, count - 1);
    }
}

bool List::pop_front() {
    int dummy;
    return pop_front(dummy);
}

bool List::pop_front(int &removedVal) {
    if (head == nullptr) {
        if (observer) {
            observer->onListUnderflow(toVector(), "pop_front");
        }
        return false;
    }
    Node *temp = head;
    removedVal = head->data;
    head = head->next;
    temp->next = nullptr;
    delete temp;
    count--;
    if (head == nullptr) {
        tail = nullptr;
    }
    if (observer) {
        observer->onListPopFront(toVector(), removedVal);
    }
    return true;
}

bool List::pop_back() {
    int dummy;
    return pop_back(dummy);
}

bool List::pop_back(int &removedVal) {
    if (head == nullptr) {
        if (observer) {
            observer->onListUnderflow(toVector(), "pop_back");
        }
        return false;
    }
    if (head == tail) {
        removedVal = head->data;
        delete head;
        head = tail = nullptr;
        count = 0;
        if (observer) {
            observer->onListPopBack(toVector(), removedVal);
        }
        return true;
    }

    Node *temp = head;
    while (temp->next != tail) {
        temp = temp->next;
    }
    removedVal = tail->data;
    temp->next = nullptr;
    delete tail;
    tail = temp;
    count--;
    if (observer) {
        observer->onListPopBack(toVector(), removedVal);
    }
    return true;
}

int List::search(int key) const {
    Node *temp = head;
    int idx = 0;
    while (temp != nullptr) {
        if (temp->data == key) {
            return idx;
        }
        temp = temp->next;
        idx++;
    }
    return -1;
}

void List::notifySearch(int key) {
    if (empty()) {
        if (observer) {
            observer->onListSearch(toVector(), key, -1, true);
        }
        return;
    }
    int idx = search(key);
    if (observer) {
        observer->onListSearch(toVector(), key, idx, false);
    }
}

bool List::empty() const {
    return head == nullptr;
}

int List::size() const {
    return count;
}

int List::getHeadVal() const {
    return head ? head->data : -1;
}

int List::getTailVal() const {
    return tail ? tail->data : -1;
}

void List::clear() {
    while (head != nullptr) {
        Node *temp = head;
        head = head->next;
        temp->next = nullptr;
        delete temp;
    }
    tail = nullptr;
    count = 0;
    if (observer) {
        observer->onListClear(toVector());
    }
}

void List::notifyInit() {
    if (observer) {
        observer->onListInit(toVector());
    }
}

vector<int> List::toVector() const {
    vector<int> res;
    Node *curr = head;
    while (curr != nullptr) {
        res.push_back(curr->data);
        curr = curr->next;
    }
    return res;
}

void linkedListVisualizer()
{
    ConsoleObserver obs(true);
    List l(&obs);
    int choice = -1;

    l.notifyInit();

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
            break;
        }
        case 3:
        {
            int dummy;
            l.pop_front(dummy); // triggers onListUnderflow or onListPopFront
            break;
        }
        case 4:
        {
            int dummy;
            l.pop_back(dummy); // triggers onListUnderflow or onListPopBack
            break;
        }
        case 5:
        {
            if (l.empty())
            {
                l.notifySearch(0);
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

            l.notifySearch(key);
            break;
        }
        case 6:
        {
            l.clear();
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