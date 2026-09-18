#include "../utils.h"
#include <iostream>
#include <vector>
#include <list>
#include <limits>

using namespace std;

class GraphDFS
{
    int V;
    list<int> *adj;

    // Recursive helper: marks current vertex and explores neighbor branches
    void dfsHelper(int u, vector<bool> &vis) const
    {
        vis[u] = true;
        cout << u << " ";

        for (int v : adj[u])
        {
            if (!vis[v])
            {
                dfsHelper(v, vis);
            }
        }
    }

public:
    GraphDFS(int vertices)
    {
        V = vertices;
        adj = new list<int>[V];
    }

    ~GraphDFS()
    {
        delete[] adj;
    }

    // Add undirected edge between u and v
    bool addEdge(int u, int v)
    {
        if (u < 0 || u >= V || v < 0 || v >= V)
            return false;
        adj[u].push_back(v);
        if (u != v)
        {
            adj[v].push_back(u);
        }
        return true;
    }

    void printGraph() const
    {
        cout << "\nAdjacency List:\n";
        for (int i = 0; i < V; i++)
        {
            cout << " [" << i << "] -> ";
            for (int neighbor : adj[i])
            {
                cout << neighbor << " ";
            }
            cout << "\n";
        }
    }

    // DFS Traversal: explores deep into each branch before backtracking
    void dfs(int src = 0) const
    {
        if (V == 0)
            return;

        vector<bool> vis(V, false);
        cout << "\nDFS Traversal Output: ";

        // Step 1: Traverse starting component
        dfsHelper(src, vis);

        // Step 2: Traverse any remaining disconnected components
        for (int i = 0; i < V; i++)
        {
            if (!vis[i])
            {
                dfsHelper(i, vis);
            }
        }
        cout << "\n";
    }
};

// Entry point called by main.cpp
void dfsVisualizer()
{
    int vertices = 5;
    cout << "\n======================================================\n";
    cout << "                    DFS VISUALIZER                    \n";
    cout << "======================================================\n";
    cout << "Enter total number of vertices: ";
    if (!(cin >> vertices) || vertices <= 0)
    {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        vertices = 5;
    }
    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    GraphDFS g(vertices);
    int choice = -1;

    while (choice != 0)
    {
        cout << "\n--- DFS MENU (Allowed Vertices: 0 to " << vertices - 1 << ") ---\n";
        cout << "1. Add Edge (u v)\n";
        cout << "2. Run DFS Traversal\n";
        cout << "3. Print Adjacency List\n";
        cout << "0. Back to Main Menu\n";
        cout << "Enter choice: ";

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
            int u, v;
            cout << "Enter edge (u v): ";
            if (cin >> u >> v)
            {
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                if (g.addEdge(u, v))
                {
                    cout << "Edge added successfully.\n";
                }
                else
                {
                    cout << "Invalid vertex indices! (Must be 0 to " << vertices - 1 << ")\n";
                }
            }
            else
            {
                cout << "Invalid input!\n";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
            }
            break;
        }
        case 2:
        {
            int src;
            cout << "Enter start vertex (0 to " << vertices - 1 << "): ";
            if (!(cin >> src) || src < 0 || src >= vertices)
            {
                src = 0;
            }
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            g.dfs(src);
            break;
        }
        case 3:
            g.printGraph();
            break;
        case 0:
            break;
        default:
            cout << "Invalid choice!\n";
            break;
        }
    }
}