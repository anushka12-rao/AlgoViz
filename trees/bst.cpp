#include "bst.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <limits>
#include <algorithm>

using namespace std;

BST::BST(IAlgoObserver *obs) : root(nullptr), nodeCount(0), observer(obs) {}

BST::~BST() {
    clearHelper(root);
    root = nullptr;
    nodeCount = 0;
}

void BST::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* BST::getObserver() const {
    return observer;
}

BST::BSTNode* BST::insertHelper(BSTNode *node, int val, bool &inserted) {
    if (node == nullptr) {
        inserted = true;
        nodeCount++;
        return new BSTNode(val);
    }

    if (val < node->data) {
        node->left = insertHelper(node->left, val, inserted);
    } else if (val > node->data) {
        node->right = insertHelper(node->right, val, inserted);
    } else {
        inserted = false; // Duplicate rejected
    }
    return node;
}

bool BST::searchHelper(BSTNode *node, int val, vector<string> &path) const {
    if (node == nullptr)
        return false;

    path.push_back("[" + to_string(node->data) + "]");
    if (node->data == val)
        return true;

    if (val < node->data) {
        path.push_back("Go Left (< " + to_string(node->data) + ")");
        return searchHelper(node->left, val, path);
    } else {
        path.push_back("Go Right (> " + to_string(node->data) + ")");
        return searchHelper(node->right, val, path);
    }
}

BST::BSTNode* BST::findMin(BSTNode *node) const {
    while (node != nullptr && node->left != nullptr) {
        node = node->left;
    }
    return node;
}

BST::BSTNode* BST::deleteHelper(BSTNode *node, int val, bool &deleted) {
    if (node == nullptr) {
        deleted = false;
        return nullptr;
    }

    if (val < node->data) {
        node->left = deleteHelper(node->left, val, deleted);
    } else if (val > node->data) {
        node->right = deleteHelper(node->right, val, deleted);
    } else {
        deleted = true;

        if (node->left == nullptr) {
            BSTNode *temp = node->right;
            delete node;
            nodeCount--;
            return temp;
        } else if (node->right == nullptr) {
            BSTNode *temp = node->left;
            delete node;
            nodeCount--;
            return temp;
        }

        BSTNode *successor = findMin(node->right);
        node->data = successor->data;
        node->right = deleteHelper(node->right, successor->data, deleted);
    }
    return node;
}

void BST::inorderHelper(BSTNode *node, vector<int> &res) const {
    if (node == nullptr)
        return;
    inorderHelper(node->left, res);
    res.push_back(node->data);
    inorderHelper(node->right, res);
}

void BST::clearHelper(BSTNode *node) {
    if (node == nullptr)
        return;
    clearHelper(node->left);
    clearHelper(node->right);
    delete node;
}

void BST::snapshotHelper(BSTNode *node, vector<TreeNodeRecord> &nodes) const {
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

bool BST::insert(int val) {
    bool inserted = false;
    root = insertHelper(root, val, inserted);
    return inserted;
}

int BST::insertBatch(const vector<int> &values, int &duplicateCount) {
    int addedCount = 0;
    duplicateCount = 0;

    for (int val : values) {
        if (insert(val)) {
            addedCount++;
        } else {
            duplicateCount++;
        }
    }

    notifyInsertBatch(values, addedCount, duplicateCount);
    return addedCount;
}

bool BST::search(int val, vector<string> &path) const {
    return searchHelper(root, val, path);
}

bool BST::remove(int val) {
    bool deleted = false;
    root = deleteHelper(root, val, deleted);
    return deleted;
}

void BST::clear() {
    clearHelper(root);
    root = nullptr;
    nodeCount = 0;
    if (observer) {
        observer->onBSTClear(getSnapshot(), "BST cleared.");
    }
}

bool BST::empty() const {
    return root == nullptr;
}

int BST::size() const {
    return nodeCount;
}

vector<int> BST::getInorder() const {
    vector<int> res;
    inorderHelper(root, res);
    return res;
}

vector<TreeNodeRecord> BST::getSnapshot() const {
    vector<TreeNodeRecord> snap;
    snapshotHelper(root, snap);
    return snap;
}

void BST::notifyInit() {
    if (observer) {
        observer->onBSTInit(getSnapshot(), "BST initialized as empty.");
    }
}

void BST::notifySearchEmpty(int target) {
    if (observer) {
        observer->onBSTSearch(getSnapshot(), target, false, {}, getInorder(),
            string(YELLOW) + "BST is empty. Cannot search." + RESET);
    }
}

void BST::notifyDeleteEmpty(int target) {
    if (observer) {
        observer->onBSTDelete(getSnapshot(), target, false, getInorder(),
            string(RED) + "UNDERFLOW! BST is already empty." + RESET);
    }
}

void BST::notifySearch(int target, bool found, const vector<string> &path) {
    if (observer) {
        string pathStr = "";
        for (size_t i = 0; i < path.size(); i++) {
            pathStr += path[i];
            if (i + 1 < path.size())
                pathStr += " -> ";
        }
        string msg;
        if (found) {
            msg = string(GREEN) + "Found " + to_string(target) + "! Path: " + pathStr + RESET;
        } else {
            msg = string(RED) + to_string(target) + " not found. Path checked: " + pathStr + RESET;
        }
        observer->onBSTSearch(getSnapshot(), target, found, path, getInorder(), msg);
    }
}

void BST::notifyDelete(int target, bool deleted) {
    if (observer) {
        string msg;
        if (deleted) {
            msg = string(GREEN) + "Deleted node [" + to_string(target) + "] successfully." + RESET;
        } else {
            msg = string(RED) + "Node [" + to_string(target) + "] not found in BST." + RESET;
        }
        observer->onBSTDelete(getSnapshot(), target, deleted, getInorder(), msg);
    }
}

void BST::notifyInsertBatch(const vector<int> &values, int addedCount, int duplicateCount) {
    if (observer) {
        string msg;
        if (addedCount > 0) {
            msg = string(GREEN) + "Inserted " + to_string(addedCount) + " value(s) into BST." + RESET;
            if (duplicateCount > 0) {
                msg += " (" + to_string(duplicateCount) + " duplicate(s) ignored)";
            }
        } else if (duplicateCount > 0) {
            msg = string(YELLOW) + "All entered value(s) were duplicates. Ignored." + RESET;
        } else {
            msg = string(RED) + "No valid values provided." + RESET;
        }
        observer->onBSTInsertBatch(getSnapshot(), values, addedCount, duplicateCount, getInorder(), msg);
    }
}

void BST::notifySorted() {
    if (observer) {
        observer->onBSTSorted(getSnapshot(), getInorder(), empty());
    }
}

void bstVisualizer()
{
    ConsoleObserver obs(true);
    BST tree(&obs);
    int choice = -1;

    tree.notifyInit();

    while (choice != 0)
    {
        cout << "\n----------------------------------------\n";
        cout << " BST CORE OPERATIONS\n";
        cout << "----------------------------------------\n";
        cout << " 1. insert(val)     - Insert single or multiple values\n";
        cout << " 2. search(val)     - Search with decision path\n";
        cout << " 3. deleteNode(val) - Delete node\n";
        cout << " 4. Clear BST\n";
        cout << " 0. Back to Trees Menu\n";
        cout << "----------------------------------------\n";
        cout << " Enter choice (0-4): ";

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
            cout << "Enter integer(s) to insert (e.g., 2 4 6 7): ";
            string line;
            getline(cin, line);

            stringstream ss(line);
            int val;
            vector<int> inputVals;

            while (ss >> val)
            {
                inputVals.push_back(val);
            }

            int dummyDup = 0;
            tree.insertBatch(inputVals, dummyDup);
            break;
        }
        case 2:
        {
            if (tree.empty())
            {
                tree.notifySearchEmpty(0);
                break;
            }
            int val;
            cout << "Enter integer to search: ";
            while (!(cin >> val))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            vector<string> path;
            bool found = tree.search(val, path);
            tree.notifySearch(val, found, path);
            break;
        }
        case 3:
        {
            if (tree.empty())
            {
                tree.notifyDeleteEmpty(0);
                break;
            }
            int val;
            cout << "Enter integer to delete: ";
            while (!(cin >> val))
            {
                cout << "Invalid input! Enter an integer: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }
            cin.ignore(numeric_limits<streamsize>::max(), '\n');

            bool deleted = tree.remove(val);
            tree.notifyDelete(val, deleted);
            break;
        }
        case 4:
        {
            tree.clear();
            break;
        }
        case 0:
            cout << "\nReturning to Trees menu...\n";
            break;
        default:
            cout << "Invalid choice! Try again.\n";
            break;
        }
    }
}
