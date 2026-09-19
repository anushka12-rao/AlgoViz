#pragma once
#include <vector>
#include <string>

class IAlgoObserver;
struct TreeNodeRecord;

class BinaryTree {
public:
    struct Node {
        int data;
        Node *left;
        Node *right;
        Node(int val) : data(val), left(nullptr), right(nullptr) {}
    };

private:
    Node *root;
    IAlgoObserver *observer;

    Node* buildTreeHelper(const std::vector<int> &preorder, int &idx);
    Node* findNodeHelper(Node *node, int target) const;
    void inorderHelper(Node *node, std::vector<int> &res) const;
    void preorderHelper(Node *node, std::vector<int> &res) const;
    void postorderHelper(Node *node, std::vector<int> &res) const;
    int heightHelper(Node *node) const;
    int countHelper(Node *node) const;
    int sumHelper(Node *node) const;
    void clearHelper(Node *node);
    void snapshotHelper(Node *node, std::vector<TreeNodeRecord> &nodes) const;

public:
    explicit BinaryTree(IAlgoObserver *obs = nullptr);
    ~BinaryTree();

    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    // Core operations
    bool insertManual(int parentVal, int newVal, char side);
    bool buildFromPreorder(const std::vector<int> &preorder);
    void clear();
    bool empty() const;

    // Tree Metrics
    int height() const;
    int count() const;
    int sum() const;

    // Traversals
    std::vector<int> getInorder() const;
    std::vector<int> getPreorder() const;
    std::vector<int> getPostorder() const;
    std::vector<std::vector<int>> getLevelOrder() const;

    // Snapshot representation
    std::vector<TreeNodeRecord> getSnapshot() const;

    // Observer notifications for visualizer
    void notifyInit();
    void notifyInorder();
    void notifyPreorder();
    void notifyPostorder();
    void notifyLevelOrder();
    void notifyMetrics();
    void notifyBuildPreorderEmpty();
};

void binaryTreeVisualizer();
