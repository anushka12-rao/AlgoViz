#pragma once
#include <vector>
#include <string>

class IAlgoObserver;
struct TreeNodeRecord;

class BST {
public:
    struct BSTNode {
        int data;
        BSTNode *left;
        BSTNode *right;
        BSTNode(int val) : data(val), left(nullptr), right(nullptr) {}
    };

private:
    BSTNode *root;
    int nodeCount;
    IAlgoObserver *observer;

    BSTNode* insertHelper(BSTNode *node, int val, bool &inserted);
    bool searchHelper(BSTNode *node, int val, std::vector<std::string> &path) const;
    BSTNode* findMin(BSTNode *node) const;
    BSTNode* deleteHelper(BSTNode *node, int val, bool &deleted);
    void inorderHelper(BSTNode *node, std::vector<int> &res) const;
    void clearHelper(BSTNode *node);
    void snapshotHelper(BSTNode *node, std::vector<TreeNodeRecord> &nodes) const;

public:
    explicit BST(IAlgoObserver *obs = nullptr);
    ~BST();

    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    // Core operations
    bool insert(int val);
    int insertBatch(const std::vector<int> &values, int &duplicateCount);
    bool search(int val, std::vector<std::string> &path) const;
    bool remove(int val);
    void clear();
    bool empty() const;
    int size() const;

    // Inspection
    std::vector<int> getInorder() const;
    std::vector<TreeNodeRecord> getSnapshot() const;

    // Observer notifications for visualizer
    void notifyInit();
    void notifySearchEmpty(int target);
    void notifyDeleteEmpty(int target);
    void notifySearch(int target, bool found, const std::vector<std::string> &path);
    void notifyDelete(int target, bool deleted);
    void notifyInsertBatch(const std::vector<int> &values, int addedCount, int duplicateCount);
    void notifySorted();
};

void bstVisualizer();
