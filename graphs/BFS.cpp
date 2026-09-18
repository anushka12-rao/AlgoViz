#include "../utils.h"
#include <iostream>
#include <vector>
#include <list>
#include <queue>
#include <limits>

using namespace std;

class GraphBFS
{
    int V;
    list<int> *adj;

public:
    GraphBFS(int vertices)
    {
        V = vertices;
        adj = new list<int>[V];
    }

    ~GraphBFS()
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

    // BFS Traversal: explores level-by-level using a FIFO queue
    void bfs(int src = 0) const
    {
        if (V == 0)
            return;

        vector<bool> vis(V, false);
        queue<int> Q;

        cout << "\nBFS Traversal Output: ";

        // Step 1: Process primary component starting at src
        vis[src] = true;
        Q.push(src);

        while (!Q.empty())
        {
            int u = Q.front();
            Q.pop();
            cout << u << " ";

            for (int v : adj[u])
            {
                if (!vis[v])
                {
                    vis[v] = true;
                    Q.push(v);
                }
            }
        }

        // Step 2: Process any remaining disconnected components
        for (int i = 0; i < V; i++)
        {
            if (!vis[i])
            {
                vis[i] = true;
                Q.push(i);

                while (!Q.empty())
                {
                    int u = Q.front();
                    Q.pop();
                    cout << u << " ";

                    for (int v : adj[u])
                    {
                        if (!vis[v])
                        {
                            vis[v] = true;
                            Q.push(v);
                        }
                    }
                }
            }
        }
        cout << "\n";
    }
};

// Entry point called by main.cpp
void bfsVisualizer()
{
    int vertices = 5;
    cout << "\n======================================================\n";
    cout << "                    BFS VISUALIZER                    \n";
    cout << "======================================================\n";
    cout << "Enter total number of vertices: ";
    if (!(cin >> vertices) || vertices <= 0)
    {
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        vertices = 5;
    }
    // Flush remaining newline so it doesn't bleed into the menu
    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    GraphBFS g(vertices);
    int choice = -1;

    while (choice != 0)
    {
        cout << "\n--- BFS MENU (Allowed Vertices: 0 to " << vertices - 1 << ") ---\n";
        cout << "1. Add Edge (u v)\n";
        cout << "2. Run BFS Traversal\n";
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
            g.bfs(src);
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