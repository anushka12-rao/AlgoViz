#include "../utils.h"
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <limits>
#include <algorithm>

using namespace std;

// ============================================================================
// BST Node Definition
// ============================================================================
class BSTNode
{
public:
    int data;       // Numerical value stored in the node
    BSTNode *left;  // Pointer to left child (strictly smaller values)
    BSTNode *right; // Pointer to right child (strictly greater values)

    BSTNode(int val)
    {
        data = val;
        left = NULL;
        right = NULL;
    }
};

// ============================================================================
// Binary Search Tree Class
// ============================================================================
class BST
{
    BSTNode *root; // Top-most node
    int count;     // Exact node count

    // Helper: Recursive Insertion
    BSTNode *insertHelper(BSTNode *node, int val, bool &inserted)
    {
        if (node == NULL)
        {
            inserted = true;
            count++;
            return new BSTNode(val);
        }

        if (val < node->data)
        {
            node->left = insertHelper(node->left, val, inserted);
        }
        else if (val > node->data)
        {
            node->right = insertHelper(node->right, val, inserted);
        }
        else
        {
            inserted = false; // Duplicate rejected
        }
        return node;
    }

    // Helper: Search with decision trace
    bool searchHelper(BSTNode *node, int val, vector<string> &path) const
    {
        if (node == NULL)
            return false;

        path.push_back("[" + to_string(node->data) + "]");
        if (node->data == val)
            return true;

        if (val < node->data)
        {
            path.push_back("Go Left (< " + to_string(node->data) + ")");
            return searchHelper(node->left, val, path);
        }
        else
        {
            path.push_back("Go Right (> " + to_string(node->data) + ")");
            return searchHelper(node->right, val, path);
        }
    }

    // Helper: Minimum node in subtree (In-Order Successor)
    BSTNode *findMin(BSTNode *node) const
    {
        while (node != NULL && node->left != NULL)
        {
            node = node->left;
        }
        return node;
    }

    // Helper: Recursive Deletion (With Double-Decrement Bug Fixed)
    BSTNode *deleteHelper(BSTNode *node, int val, bool &deleted)
    {
        if (node == NULL)
        {
            deleted = false;
            return NULL;
        }

        if (val < node->data)
        {
            node->left = deleteHelper(node->left, val, deleted);
        }
        else if (val > node->data)
        {
            node->right = deleteHelper(node->right, val, deleted);
        }
        else
        {
            deleted = true;

            // Case 1 & Case 2: 0 or 1 child
            // Decrement count ONLY when memory is physically deallocated
            if (node->left == NULL)
            {
                BSTNode *temp = node->right;
                delete node;
                count--;
                return temp;
            }
            else if (node->right == NULL)
            {
                BSTNode *temp = node->left;
                delete node;
                count--;
                return temp;
            }

            // Case 3: 2 children
            // Find in-order successor, swap value, and delete successor recursively.
            // Notice: We do NOT decrement count here because the recursive call
            // to delete the successor will hit Case 1/2 and decrement count once.
            BSTNode *successor = findMin(node->right);
            node->data = successor->data;
            node->right = deleteHelper(node->right, successor->data, deleted);
        }
        return node;
    }

    // Inorder: Left -> Root -> Right (Produces strictly sorted values)
    void inorderHelper(BSTNode *node) const
    {
        if (node == NULL)
            return;
        inorderHelper(node->left);
        cout << CYAN << "[" << node->data << "] " << RESET;
        inorderHelper(node->right);
    }

    // Post-order memory cleanup
    void clearHelper(BSTNode *node)
    {
        if (node == NULL)
            return;
        clearHelper(node->left);
        clearHelper(node->right);
        delete node;
    }

    // ASCII Tree Visualizer
    void printTreeBranches(BSTNode *node, const string &prefix, bool isLeft) const
    {
        if (node == NULL)
            return;

        cout << prefix;
        cout << (isLeft ? "+-- " : "\\-- ");
        cout << CYAN << "[" << node->data << "]" << RESET << "\n";

        printTreeBranches(node->left, prefix + (isLeft ? "|   " : "    "), true);
        printTreeBranches(node->right, prefix + (isLeft ? "|   " : "    "), false);
    }

public:
    BST()
    {
        root = NULL;
        count = 0;
    }

    ~BST()
    {
        clear();
    }

    bool insert(int val)
    {
        bool inserted = false;
        root = insertHelper(root, val, inserted);
        return inserted;
    }

    bool search(int val, vector<string> &path) const
    {
        return searchHelper(root, val, path);
    }

    bool remove(int val)
    {
        bool deleted = false;
        root = deleteHelper(root, val, deleted);
        return deleted;
    }

    void clear()
    {
        clearHelper(root);
        root = NULL;
        count = 0;
    }

    bool empty() const
    {
        return root == NULL;
    }

    void printSorted() const
    {
        if (empty())
        {
            cout << "  Tree is empty.\n";
            return;
        }
        cout << "  Sorted Values (Inorder): ";
        inorderHelper(root);
        cout << "\n";
    }

    void render(const string &statusMsg = "") const
    {
        cout << "\n======================================================\n";
        cout << "       BINARY SEARCH TREE (BST) VISUALIZER           \n";
        cout << "======================================================\n\n";

        if (!statusMsg.empty())
        {
            cout << " Status: " << statusMsg << "\n\n";
        }

        if (empty())
        {
            cout << "  root -> NULL\n";
            cout << "\n  [ BST IS EMPTY ]\n";
            return;
        }

        cout << " Tree Structure:\n\n";
        cout << " root\n";
        printTreeBranches(root, " ", false);

        cout << "\n Total Nodes: " << count << "\n";
        printSorted();
    }
};

// ============================================================================
// BST Visualizer Coordinator Loop
// ============================================================================
void bstVisualizer()
{
    BST tree;
    int choice = -1;

    tree.render("BST initialized as empty.");

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
            int addedCount = 0;
            int duplicateCount = 0;

            while (ss >> val)
            {
                if (tree.insert(val))
                {
                    addedCount++;
                }
                else
                {
                    duplicateCount++;
                }
            }

            if (addedCount > 0)
            {
                string msg = string(GREEN) + "Inserted " + to_string(addedCount) + " value(s) into BST." + RESET;
                if (duplicateCount > 0)
                {
                    msg += " (" + to_string(duplicateCount) + " duplicate(s) ignored)";
                }
                tree.render(msg);
            }
            else if (duplicateCount > 0)
            {
                tree.render(string(YELLOW) + "All entered value(s) were duplicates. Ignored." + RESET);
            }
            else
            {
                tree.render(string(RED) + "No valid values provided." + RESET);
            }
            break;
        }
        case 2:
        {
            if (tree.empty())
            {
                tree.render(string(YELLOW) + "BST is empty. Cannot search." + RESET);
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

            string pathStr = "";
            for (size_t i = 0; i < path.size(); i++)
            {
                pathStr += path[i];
                if (i + 1 < path.size())
                    pathStr += " -> ";
            }

            if (found)
            {
                tree.render(string(GREEN) + "Found " + to_string(val) + "! Path: " + pathStr + RESET);
            }
            else
            {
                tree.render(string(RED) + to_string(val) + " not found. Path checked: " + pathStr + RESET);
            }
            break;
        }
        case 3:
        {
            if (tree.empty())
            {
                tree.render(string(RED) + "UNDERFLOW! BST is already empty." + RESET);
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

            if (tree.remove(val))
            {
                tree.render(string(GREEN) + "Deleted node [" + to_string(val) + "] successfully." + RESET);
            }
            else
            {
                tree.render(string(RED) + "Node [" + to_string(val) + "] not found in BST." + RESET);
            }
            break;
        }
        case 4:
        {
            tree.clear();
            tree.render("BST cleared.");
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