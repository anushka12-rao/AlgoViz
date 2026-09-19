#include "queue.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <limits>

using namespace std;

Queue::Queue(IAlgoObserver *obs) : head(nullptr), tail(nullptr), count(0), observer(obs) {}

Queue::~Queue() {
    while (!empty()) {
        Node *temp = head;
        head = head->next;
        delete temp;
    }
    tail = nullptr;
    count = 0;
}

void Queue::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* Queue::getObserver() const {
    return observer;
}

void Queue::push(int data) {
    Node *newNode = new Node(data);
    if (empty()) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        tail = newNode;
    }
    count++;
    if (observer) {
        observer->onQueuePush(toVector(), data);
    }
}

bool Queue::pop() {
    int dummy;
    return pop(dummy);
}

bool Queue::pop(int &removedVal) {
    if (empty()) {
        if (observer) {
            observer->onQueueUnderflow(toVector());
        }
        return false;
    }
    Node *temp = head;
    removedVal = head->data;
    head = head->next;
    if (head == nullptr) {
        tail = nullptr;
    }
    delete temp;
    count--;
    if (observer) {
        observer->onQueuePop(toVector(), removedVal);
    }
    return true;
}

int Queue::front() const {
    if (empty()) {
        return -1;
    }
    return head->data;
}

int Queue::rear() const {
    if (empty()) {
        return -1;
    }
    return tail->data;
}

bool Queue::empty() const {
    return head == nullptr;
}

int Queue::size() const {
    return count;
}

void Queue::clear() {
    while (!empty()) {
        Node *temp = head;
        head = head->next;
        if (head == nullptr) {
            tail = nullptr;
        }
        delete temp;
        count--;
    }
    if (observer) {
        observer->onQueueClear(toVector());
    }
}

void Queue::notifyInit() {
    if (observer) {
        observer->onQueueInit(toVector());
    }
}

void Queue::notifyFront() {
    if (empty()) {
        if (observer) {
            observer->onQueueFront(toVector(), -1, true);
        }
    } else {
        if (observer) {
            observer->onQueueFront(toVector(), head->data, false);
        }
    }
}

void Queue::notifyEmptyCheck() {
    if (observer) {
        observer->onQueueEmptyCheck(toVector(), empty());
    }
}

vector<int> Queue::toVector() const {
    vector<int> res;
    Node *curr = head;
    while (curr != nullptr) {
        res.push_back(curr->data);
        curr = curr->next;
    }
    return res;
}

void queueVisualizer()
{
    ConsoleObserver obs(true);
    Queue q(&obs);
    int choice = -1;

    q.notifyInit();

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
            break;
        }
        case 2:
        {
            if (q.empty())
            {
                int dummy;
                q.pop(dummy); // triggers onQueueUnderflow
                break;
            }
            int removed;
            q.pop(removed);
            break;
        }
        case 3:
        {
            q.notifyFront();
            break;
        }
        case 4:
        {
            q.notifyEmptyCheck();
            break;
        }
        case 5:
        {
            q.clear();
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