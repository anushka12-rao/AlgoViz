#pragma once
#include <vector>
#include <string>

class IAlgoObserver;

static const int STACK_MAX_CAPACITY = 7;

class Stack {
private:
    std::vector<int> v;
    IAlgoObserver *observer;

public:
    explicit Stack(IAlgoObserver *obs = nullptr);
    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    // Core operations
    bool push(int val);
    bool pop();
    bool pop(int &poppedVal);
    int top() const;
    bool empty() const;
    int size() const;
    void clear();

    // Observer notifications
    void notifyInit();
    void notifyTop();
    void notifyEmptyCheck();

    // Inspection
    const std::vector<int>& getElements() const;
};

void stackVisualizer();
