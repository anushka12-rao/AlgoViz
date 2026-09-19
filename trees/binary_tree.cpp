#include "binary_tree.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <sstream>
#include <limits>
#include <algorithm>

using namespace std;

BinaryTree::BinaryTree(IAlgoObserver *obs) : root(nullptr), observer(obs) {}

BinaryTree::~BinaryTree() {
    clearHelper(root);
    root = nullptr;
}

void BinaryTree::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* BinaryTree::getObserver() const {
    return observer;
}

BinaryTree::Node* BinaryTree::buildTreeHelper(const vector<int> &preorder, int &idx) {
    idx++;
    if (idx >= static_cast<int>(preorder.size()) || preorder[idx] == -1) {
        return nullptr;
    }

    Node *current = new Node(preorder[idx]);
    current->left = buildTreeHelper(preorder, idx);
    current->right = buildTreeHelper(preorder, idx);
    return current;
}

BinaryTree::Node* BinaryTree::findNodeHelper(Node *node, int target) const {
    if (node == nullptr)
        return nullptr;
    if (node->data == target)
        return node;

    Node *leftSearch = findNodeHelper(node->left, target);
    if (leftSearch != nullptr)
        return leftSearch;

    return findNodeHelper(node->right, target);
}

void BinaryTree::inorderHelper(Node *node, vector<int> &res) const {
    if (node == nullptr)
        return;
    inorderHelper(node->left, res);
    res.push_back(node->data);
    inorderHelper(node->right, res);
}

void BinaryTree::preorderHelper(Node *node, vector<int> &res) const {
    if (node == nullptr)
        return;
    res.push_back(node->data);
    preorderHelper(node->left, res);
    preorderHelper(node->right, res);
}

void BinaryTree::postorderHelper(Node *node, vector<int> &res) const {
    if (node == nullptr)
        return;
    postorderHelper(node->left, res);
    postorderHelper(node->right, res);
    res.push_back(node->data);
}

int BinaryTree::heightHelper(Node *node) const {
    if (node == nullptr)
        return 0;
    return 1 + max(heightHelper(node->left), heightHelper(node->right));
}

int BinaryTree::countHelper(Node *node) const {
    if (node == nullptr)
        return 0;
    return 1 + countHelper(node->left) + countHelper(node->right);
}

int BinaryTree::sumHelper(Node *node) const {
    if (node == nullptr)
        return 0;
    return node->data + sumHelper(node->left) + sumHelper(node->right);
}

void BinaryTree::clearHelper(Node *node) {
    if (node == nullptr)
        return;
    clearHelper(node->left);
    clearHelper(node->right);
    delete node;
}

void BinaryTree::snapshotHelper(Node *node, vector<TreeNodeRecord> &nodes) const {
    if (node == nullptr)
        return;
    int curId = static_cast<int>(nodes.size());
    nodes.push_back(TreeNodeRecord(curId, node->data, -1, -1));
    if (node->left) {
        nodes[curId].left_id = static_cast<int>(nodes.size());
        snapshotHelper(node->left, nodes);
    }
    if (node->right) {
        nodes[curId].right_id = static_cast<int>(nodes.size());
        snapshotHelper(node->right, nodes);
    }
}

bool BinaryTree::insertManual(int parentVal, int newVal, char side) {
    if (root == nullptr) {
        root = new Node(newVal);
        if (observer) {
            observer->onBinaryTreeInsert(getSnapshot(), 0, newVal, side, true,
                string(GREEN) + "Root node [" + to_string(newVal) + "] created." + RESET);
        }
        return true;
    }

    Node *parent = findNodeHelper(root, parentVal);
    if (parent == nullptr) {
        if (observer) {
            observer->onBinaryTreeInsert(getSnapshot(), parentVal, newVal, side, false,
                string(RED) + "Failed: Parent not found or branch already occupied." + RESET);
        }
        return false;
    }

    if (side == 'L' || side == 'l') {
        if (parent->left != nullptr) {
            if (observer) {
                observer->onBinaryTreeInsert(getSnapshot(), parentVal, newVal, side, false,
                    string(RED) + "Failed: Parent not found or branch already occupied." + RESET);
            }
            return false;
        }
        parent->left = new Node(newVal);
        if (observer) {
            observer->onBinaryTreeInsert(getSnapshot(), parentVal, newVal, side, true,
                string(GREEN) + "Added [" + to_string(newVal) + "] as " + static_cast<char>(toupper(side)) + "-child of [" + to_string(parentVal) + "]." + RESET);
        }
        return true;
    } else if (side == 'R' || side == 'r') {
        if (parent->right != nullptr) {
            if (observer) {
                observer->onBinaryTreeInsert(getSnapshot(), parentVal, newVal, side, false,
                    string(RED) + "Failed: Parent not found or branch already occupied." + RESET);
            }
            return false;
        }
        parent->right = new Node(newVal);
        if (observer) {
            observer->onBinaryTreeInsert(getSnapshot(), parentVal, newVal, side, true,
                string(GREEN) + "Added [" + to_string(newVal) + "] as " + static_cast<char>(toupper(side)) + "-child of [" + to_string(parentVal) + "]." + RESET);
        }
        return true;
    }

    if (observer) {
        observer->onBinaryTreeInsert(getSnapshot(), parentVal, newVal, side, false,
            string(RED) + "Failed: Parent not found or branch already occupied." + RESET);
    }
    return false;
}

bool BinaryTree::buildFromPreorder(const vector<int> &preorder) {
    if (preorder.empty()) {
        if (observer) {
            observer->onBinaryTreeBuildPreorder(getSnapshot(), preorder, false,
                string(RED) + "No values entered. Tree unchanged." + RESET);
        }
        return false;
    }
    clearHelper(root);
    root = nullptr;
    int idx = -1;
    root = buildTreeHelper(preorder, idx);
    if (observer) {
        observer->onBinaryTreeBuildPreorder(getSnapshot(), preorder, true,
            string(GREEN) + "Binary tree built from your preorder sequence!" + RESET);
    }
    return true;
}

void BinaryTree::clear() {
    clearHelper(root);
    root = nullptr;
    if (observer) {
        observer->onBinaryTreeClear(getSnapshot(), "Tree cleared.");
    }
}

bool BinaryTree::empty() const {
    return root == nullptr;
}

int BinaryTree::height() const {
    return heightHelper(root);
}

int BinaryTree::count() const {
    return countHelper(root);
}

int BinaryTree::sum() const {
    return sumHelper(root);
}

vector<int> BinaryTree::getInorder() const {
    vector<int> res;
    inorderHelper(root, res);
    return res;
}

vector<int> BinaryTree::getPreorder() const {
    vector<int> res;
    preorderHelper(root, res);
    return res;
}

vector<int> BinaryTree::getPostorder() const {
    vector<int> res;
    postorderHelper(root, res);
    return res;
}

vector<vector<int>> BinaryTree::getLevelOrder() const {
    vector<vector<int>> levels;
    if (root == nullptr) return levels;

    queue<Node *> q;
    q.push(root);
    q.push(nullptr);

    vector<int> currentLevel;

    while (!q.empty()) {
        Node *curr = q.front();
        q.pop();

        if (curr == nullptr) {
            levels.push_back(currentLevel);
            currentLevel.clear();
            if (!q.empty()) {
                q.push(nullptr);
            } else {
                break;
            }
        } else {
            currentLevel.push_back(curr->data);
            if (curr->left != nullptr) q.push(curr->left);
            if (curr->right != nullptr) q.push(curr->right);
        }
    }
    return levels;
}

vector<TreeNodeRecord> BinaryTree::getSnapshot() const {
    vector<TreeNodeRecord> snap;
    snapshotHelper(root, snap);
    return snap;
}

void BinaryTree::notifyInit() {
    if (observer) {
        observer->onBinaryTreeInit(getSnapshot(), "Tree is empty. Add nodes or enter a preorder sequence to begin.");
    }
}

void BinaryTree::notifyInorder() {
    if (observer) {
        observer->onBinaryTreeTraversal(getSnapshot(), "inorder", getInorder(), empty());
    }
}

void BinaryTree::notifyPreorder() {
    if (observer) {
        observer->onBinaryTreeTraversal(getSnapshot(), "preorder", getPreorder(), empty());
    }
}

void BinaryTree::notifyPostorder() {
    if (observer) {
        observer->onBinaryTreeTraversal(getSnapshot(), "postorder", getPostorder(), empty());
    }
}

void BinaryTree::notifyLevelOrder() {
    if (observer) {
        observer->onBinaryTreeLevelOrder(getSnapshot(), getLevelOrder(), empty());
    }
}

void BinaryTree::notifyMetrics() {
    if (observer) {
        observer->onBinaryTreeMetrics(getSnapshot(), count(), height(), sum(), empty());
    }
}

void BinaryTree::notifyBuildPreorderEmpty() {
    if (observer) {
        observer->onBinaryTreeBuildPreorder(getSnapshot(), {}, false, string(RED) + "No values entered. Tree unchanged." + RESET);
    }
}

void binaryTreeVisualizer()
{
    ConsoleObserver obs(true);
    BinaryTree tree(&obs);
    int choice = -1;

    tree.notifyInit();

    while (choice != 0)
    {
        cout << "\n----------------------------------------\n";
        cout << " BINARY TREE OPERATIONS\n";
        cout << "----------------------------------------\n";
        cout << " 1. Add Node Interactively (Parent & L/R)\n";
        cout << " 2. Enter Preorder Sequence (-1 for NULL)\n";
        cout << " 3. Perform Level Order Traversal\n";
        cout << " 4. Perform Inorder Traversal\n";
        cout << " 5. Perform Preorder Traversal\n";
        cout << " 6. Perform Postorder Traversal\n";
        cout << " 7. Display Tree Metrics (Height, Count, Sum)\n";
        cout << " 8. Clear Tree\n";
        cout << " 0. Back to Trees Menu\n";
        cout << "----------------------------------------\n";
        cout << " Enter choice (0-8): ";

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
            if (tree.empty())
            {
                int rootVal;
                cout << "Tree is empty. Enter value for ROOT node: ";
                while (!(cin >> rootVal))
                {
                    cout << "Invalid input! Enter an integer: ";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                }
                cin.ignore(numeric_limits<streamsize>::max(), '\n');

                tree.insertManual(0, rootVal, 'L');
            }
            else
            {
                int parentVal, newVal;
                char side;

                cout << "Enter existing parent node value: ";
                while (!(cin >> parentVal))
                {
                    cout << "Invalid input! Enter an integer: ";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                }
                cin.ignore(numeric_limits<streamsize>::max(), '\n');

                cout << "Attach to Left (L) or Right (R)? ";
                cin >> side;
                cin.ignore(numeric_limits<streamsize>::max(), '\n');

                cout << "Enter new node value: ";
                while (!(cin >> newVal))
                {
                    cout << "Invalid input! Enter an integer: ";
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                }
                cin.ignore(numeric_limits<streamsize>::max(), '\n');

                tree.insertManual(parentVal, newVal, side);
            }
            break;
        }
        case 2:
        {
            cout << "\nEnter space-separated preorder values (-1 represents NULL):\n";
            cout << "Example: 1 2 -1 -1 3 4 -1 -1 5 -1 -1\n";
            cout << "Input: ";

            string line;
            getline(cin, line);

            stringstream ss(line);
            vector<int> userSequence;
            int temp;

            while (ss >> temp)
            {
                userSequence.push_back(temp);
            }

            if (userSequence.empty())
            {
                tree.notifyBuildPreorderEmpty();
            }
            else
            {
                tree.buildFromPreorder(userSequence);
            }
            break;
        }
        case 3:
        {
            tree.notifyLevelOrder();
            break;
        }
        case 4:
        {
            tree.notifyInorder();
            break;
        }
        case 5:
        {
            tree.notifyPreorder();
            break;
        }
        case 6:
        {
            tree.notifyPostorder();
            break;
        }
        case 7:
        {
            tree.notifyMetrics();
            break;
        }
        case 8:
        {
            tree.clear();
            break;
        }
        case 0:
            cout << "\nReturning to menu...\n";
            break;
        default:
            cout << "Invalid choice! Try again.\n";
            break;
        }
    }
}
