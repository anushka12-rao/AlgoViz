#include "DFS.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <list>
#include <limits>

using namespace std;

GraphDFS::GraphDFS(int vertices, IAlgoObserver *obs) : V(vertices), observer(obs) {
    adj = new list<int>[V];
    if (observer) {
        observer->onGraphInit(V);
    }
}

GraphDFS::~GraphDFS() {
    delete[] adj;
}

void GraphDFS::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* GraphDFS::getObserver() const {
    return observer;
}

int GraphDFS::getVertexCount() const {
    return V;
}

bool GraphDFS::addEdge(int u, int v) {
    if (u < 0 || u >= V || v < 0 || v >= V) {
        if (observer) {
            observer->onGraphAddEdge(u, v, false);
        }
        return false;
    }
    adj[u].push_back(v);
    if (u != v) {
        adj[v].push_back(u);
    }
    if (observer) {
        observer->onGraphAddEdge(u, v, true);
    }
    return true;
}

vector<vector<int>> GraphDFS::getAdjacencyList() const {
    vector<vector<int>> res(V);
    for (int i = 0; i < V; i++) {
        for (int neighbor : adj[i]) {
            res[i].push_back(neighbor);
        }
    }
    return res;
}

void GraphDFS::printGraph() const {
    if (observer) {
        observer->onGraphPrint(V, getAdjacencyList());
    } else {
        cout << "\nAdjacency List:\n";
        for (int i = 0; i < V; i++) {
            cout << " [" << i << "] -> ";
            for (int neighbor : adj[i]) {
                cout << neighbor << " ";
            }
            cout << "\n";
        }
    }
}

void GraphDFS::dfsHelper(int u, vector<bool> &vis, vector<int> &traversal, vector<int> &callStack) const {
    vis[u] = true;
    traversal.push_back(u);
    callStack.push_back(u);

    if (observer) {
        observer->onDFSVertexEnter(u, callStack, vis);
    }

    for (int v : adj[u]) {
        if (!vis[v]) {
            if (observer) {
                observer->onDFSNeighborInspect(u, v, false);
            }
            dfsHelper(v, vis, traversal, callStack);
        } else {
            if (observer) {
                observer->onDFSNeighborInspect(u, v, true);
            }
        }
    }

    callStack.pop_back();
    if (observer) {
        observer->onDFSVertexBacktrack(u, callStack);
    }
}

vector<int> GraphDFS::dfs(int src) const {
    vector<int> traversal;
    if (V == 0) return traversal;

    if (src < 0 || src >= V) {
        src = 0;
    }

    auto adjSnapshot = getAdjacencyList();
    if (observer) {
        observer->onDFSTraversalStart(V, src, adjSnapshot);
    }

    vector<bool> vis(V, false);
    vector<int> callStack;

    // Step 1: Traverse starting component
    dfsHelper(src, vis, traversal, callStack);

    // Step 2: Traverse any remaining disconnected components
    for (int i = 0; i < V; i++) {
        if (!vis[i]) {
            if (observer) {
                observer->onDFSComponentTransition(i);
            }
            dfsHelper(i, vis, traversal, callStack);
        }
    }

    if (observer) {
        observer->onDFSTraversalComplete(V, src, traversal, adjSnapshot);
    }

    return traversal;
}

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

    ConsoleObserver obs(true);
    GraphDFS g(vertices, &obs);
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
