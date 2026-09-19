#pragma once
#include <vector>
#include <string>

class IAlgoObserver;

static const int LIST_VISUAL_LIMIT = 6;

class List {
public:
    struct Node {
        int data;
        Node *next;
        Node(int val) : data(val), next(nullptr) {}
    };

private:
    Node *head;
    Node *tail;
    int count;
    IAlgoObserver *observer;

public:
    explicit List(IAlgoObserver *obs = nullptr);
    ~List();

    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    // Core operations
    void push_front(int val);
    void push_back(int val);
    bool pop_front();
    bool pop_front(int &removedVal);
    bool pop_back();
    bool pop_back(int &removedVal);
    int search(int key) const;
    bool empty() const;
    int size() const;
    void clear();

    int getHeadVal() const;
    int getTailVal() const;

    // Observer notifications
    void notifyInit();
    void notifySearch(int key);

    // State export
    std::vector<int> toVector() const;
};

void linkedListVisualizer();
