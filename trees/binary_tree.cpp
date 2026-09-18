#include "../utils.h"
#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <sstream>
#include <limits>
#include <algorithm>

using namespace std;

// ============================================================================
// Node Definition
// ============================================================================
class Node
{
public:
    int data;
    Node *left;
    Node *right;

    Node(int val)
    {
        data = val;
        left = NULL;
        right = NULL;
    }
};

// ============================================================================
// Binary Tree Class
// ============================================================================
class BinaryTree
{
    Node *root;

    // Helper: Recursively build from preorder sequence with -1
    Node *buildTreeHelper(const vector<int> &preorder, int &idx)
    {
        idx++;
        if (idx >= static_cast<int>(preorder.size()) || preorder[idx] == -1)
        {
            return NULL;
        }

        Node *current = new Node(preorder[idx]);
        current->left = buildTreeHelper(preorder, idx);
        current->right = buildTreeHelper(preorder, idx);
        return current;
    }

    // Helper: Find node by value to attach children interactively
    Node *findNodeHelper(Node *node, int target)
    {
        if (node == NULL)
            return NULL;
        if (node->data == target)
            return node;

        Node *leftSearch = findNodeHelper(node->left, target);
        if (leftSearch != NULL)
            return leftSearch;

        return findNodeHelper(node->right, target);
    }

    // Traversals
    void inorderHelper(Node *node) const
    {
        if (node == NULL)
            return;
        inorderHelper(node->left);
        cout << CYAN << "[" << node->data << "] " << RESET;
        inorderHelper(node->right);
    }

    void preorderHelper(Node *node) const
    {
        if (node == NULL)
            return;
        cout << CYAN << "[" << node->data << "] " << RESET;
        preorderHelper(node->left);
        preorderHelper(node->right);
    }

    void postorderHelper(Node *node) const
    {
        if (node == NULL)
            return;
        postorderHelper(node->left);
        postorderHelper(node->right);
        cout << CYAN << "[" << node->data << "] " << RESET;
    }

    // Tree Metrics
    int heightHelper(Node *node) const
    {
        if (node == NULL)
            return 0;
        return 1 + max(heightHelper(node->left), heightHelper(node->right));
    }

    int countHelper(Node *node) const
    {
        if (node == NULL)
            return 0;
        return 1 + countHelper(node->left) + countHelper(node->right);
    }

    int sumHelper(Node *node) const
    {
        if (node == NULL)
            return 0;
        return node->data + sumHelper(node->left) + sumHelper(node->right);
    }

    // Memory cleanup
    void clearHelper(Node *node)
    {
        if (node == NULL)
            return;
        clearHelper(node->left);
        clearHelper(node->right);
        delete node;
    }

    // Cross-platform ASCII Hierarchy Renderer
    void printTreeBranches(Node *node, const string &prefix, bool isLeft) const
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
    BinaryTree()
    {
        root = NULL;
    }

    ~BinaryTree()
    {
        clear();
    }

    void clear()
    {
        clearHelper(root);
        root = NULL;
    }

    bool empty() const
    {
        return root == NULL;
    }

    void buildFromPreorder(const vector<int> &preorder)
    {
        clear();
        int idx = -1;
        root = buildTreeHelper(preorder, idx);
    }

    // Insert root or attach a child to any existing parent node
    bool insertManual(int parentVal, int newVal, char side)
    {
        if (root == NULL)
        {
            root = new Node(newVal);
            return true;
        }

        Node *parent = findNodeHelper(root, parentVal);
        if (parent == NULL)
            return false;

        if (side == 'L' || side == 'l')
        {
            if (parent->left != NULL)
                return false; // Left already occupied
            parent->left = new Node(newVal);
            return true;
        }
        else if (side == 'R' || side == 'r')
        {
            if (parent->right != NULL)
                return false; // Right already occupied
            parent->right = new Node(newVal);
            return true;
        }
        return false;
    }

    void printInorder() const
    {
        if (empty())
        {
            cout << " Tree is empty.\n";
            return;
        }
        cout << "\n Inorder Traversal (Left -> Root -> Right):\n ";
        inorderHelper(root);
        cout << "\n";
    }

    void printPreorder() const
    {
        if (empty())
        {
            cout << " Tree is empty.\n";
            return;
        }
        cout << "\n Preorder Traversal (Root -> Left -> Right):\n ";
        preorderHelper(root);
        cout << "\n";
    }

    void printPostorder() const
    {
        if (empty())
        {
            cout << " Tree is empty.\n";
            return;
        }
        cout << "\n Postorder Traversal (Left -> Right -> Root):\n ";
        postorderHelper(root);
        cout << "\n";
    }

    // Level-order (BFS) with NULL markers for line breaks
    void printLevelOrder() const
    {
        if (root == NULL)
        {
            cout << " Tree is empty.\n";
            return;
        }

        cout << "\n Level Order Traversal (BFS):\n";
        queue<Node *> q;
        q.push(root);
        q.push(NULL);

        int level = 0;
        cout << "   Level " << level << ": ";

        while (!q.empty())
        {
            Node *curr = q.front();
            q.pop();

            if (curr == NULL)
            {
                if (!q.empty())
                {
                    level++;
                    cout << "\n   Level " << level << ": ";
                    q.push(NULL);
                    continue;
                }
                else
                {
                    break;
                }
            }

            cout << CYAN << "[" << curr->data << "] " << RESET;

            if (curr->left != NULL)
                q.push(curr->left);
            if (curr->right != NULL)
                q.push(curr->right);
        }
        cout << "\n";
    }

    void printMetrics() const
    {
        if (empty())
        {
            cout << " Tree is empty.\n";
            return;
        }
        cout << "\n Tree Metrics:\n";
        cout << "  - Total Nodes : " << countHelper(root) << "\n";
        cout << "  - Tree Height : " << heightHelper(root) << "\n";
        cout << "  - Sum of Nodes: " << sumHelper(root) << "\n";
    }

    void render(const string &statusMsg = "") const
    {
        cout << "\n======================================================\n";
        cout << "            BINARY TREE VISUALIZER                   \n";
        cout << "======================================================\n\n";

        if (!statusMsg.empty())
        {
            cout << " Status: " << statusMsg << "\n\n";
        }

        if (empty())
        {
            cout << "  root -> NULL\n";
            cout << "\n  [ TREE IS EMPTY ]\n";
            return;
        }

        cout << " Tree Hierarchy:\n\n";
        cout << " root\n";
        printTreeBranches(root, " ", false);
        cout << "\n Total Nodes: " << countHelper(root)
             << " | Height: " << heightHelper(root) << "\n";
    }
};

// ============================================================================
// Coordinator Loop for AlgoViz
// ============================================================================
void binaryTreeVisualizer()
{
    BinaryTree tree;
    int choice = -1;

    tree.render("Tree is empty. Add nodes or enter a preorder sequence to begin.");

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
                tree.render(string(GREEN) + "Root node [" + to_string(rootVal) + "] created." + RESET);
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

                bool success = tree.insertManual(parentVal, newVal, side);
                if (success)
                {
                    tree.render(string(GREEN) + "Added [" + to_string(newVal) + "] as " + (char)toupper(side) + "-child of [" + to_string(parentVal) + "]." + RESET);
                }
                else
                {
                    tree.render(string(RED) + "Failed: Parent not found or branch already occupied." + RESET);
                }
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
                tree.render(string(RED) + "No values entered. Tree unchanged." + RESET);
            }
            else
            {
                tree.buildFromPreorder(userSequence);
                tree.render(string(GREEN) + "Binary tree built from your preorder sequence!" + RESET);
            }
            break;
        }
        case 3:
        {
            if (tree.empty())
            {
                tree.render(string(YELLOW) + "Tree is empty. Insert data first." + RESET);
            }
            else
            {
                tree.render();
                tree.printLevelOrder();
            }
            break;
        }
        case 4:
        {
            if (tree.empty())
            {
                tree.render(string(YELLOW) + "Tree is empty. Insert data first." + RESET);
            }
            else
            {
                tree.render();
                tree.printInorder();
            }
            break;
        }
        case 5:
        {
            if (tree.empty())
            {
                tree.render(string(YELLOW) + "Tree is empty. Insert data first." + RESET);
            }
            else
            {
                tree.render();
                tree.printPreorder();
            }
            break;
        }
        case 6:
        {
            if (tree.empty())
            {
                tree.render(string(YELLOW) + "Tree is empty. Insert data first." + RESET);
            }
            else
            {
                tree.render();
                tree.printPostorder();
            }
            break;
        }
        case 7:
        {
            if (tree.empty())
            {
                tree.render(string(YELLOW) + "Tree is empty. Insert data first." + RESET);
            }
            else
            {
                tree.render();
                tree.printMetrics();
            }
            break;
        }
        case 8:
        {
            tree.clear();
            tree.render("Tree cleared.");
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