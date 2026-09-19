#pragma once
#include <vector>
#include <string>

class IAlgoObserver;

static const int QUEUE_VISUAL_LIMIT = 6;

class Queue {
public:
    struct Node {
        int data;
        Node *next;
        Node(int val) : data(val), next(nullptr) {}
    };

private:
    Node *head; // front
    Node *tail; // rear
    int count;
    IAlgoObserver *observer;

public:
    explicit Queue(IAlgoObserver *obs = nullptr);
    ~Queue();

    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    // Core operations
    void push(int data);
    bool pop();
    bool pop(int &removedVal);
    int front() const;
    int rear() const;
    bool empty() const;
    int size() const;
    void clear();

    // Observer notifications
    void notifyInit();
    void notifyFront();
    void notifyEmptyCheck();

    // State export
    std::vector<int> toVector() const;
};

void queueVisualizer();
