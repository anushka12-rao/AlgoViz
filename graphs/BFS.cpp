#include "BFS.h"
#include "../observer.h"
#include "../utils.h"
#include <iostream>
#include <vector>
#include <list>
#include <queue>
#include <limits>

using namespace std;

GraphBFS::GraphBFS(int vertices, IAlgoObserver *obs) : V(vertices), observer(obs) {
    adj = new list<int>[V];
    if (observer) {
        observer->onGraphInit(V);
    }
}

GraphBFS::~GraphBFS() {
    delete[] adj;
}

void GraphBFS::setObserver(IAlgoObserver *obs) {
    observer = obs;
}

IAlgoObserver* GraphBFS::getObserver() const {
    return observer;
}

int GraphBFS::getVertexCount() const {
    return V;
}

bool GraphBFS::addEdge(int u, int v) {
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

vector<vector<int>> GraphBFS::getAdjacencyList() const {
    vector<vector<int>> res(V);
    for (int i = 0; i < V; i++) {
        for (int neighbor : adj[i]) {
            res[i].push_back(neighbor);
        }
    }
    return res;
}

void GraphBFS::printGraph() const {
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

vector<int> GraphBFS::bfs(int src) const {
    vector<int> traversal;
    if (V == 0) return traversal;

    if (src < 0 || src >= V) {
        src = 0;
    }

    auto adjSnapshot = getAdjacencyList();
    if (observer) {
        observer->onBFSTraversalStart(V, src, adjSnapshot);
    }

    vector<bool> vis(V, false);
    queue<int> Q;
    vector<int> currentQueue;

    // Step 1: Process primary component starting at src
    vis[src] = true;
    Q.push(src);
    currentQueue.push_back(src);
    if (observer) {
        observer->onBFSVertexEnqueued(src, currentQueue, vis);
    }

    while (!Q.empty()) {
        int u = Q.front();
        Q.pop();
        currentQueue.erase(currentQueue.begin());
        traversal.push_back(u);

        if (observer) {
            observer->onBFSVertexDequeued(u, currentQueue, vis);
        }

        for (int v : adj[u]) {
            if (!vis[v]) {
                vis[v] = true;
                Q.push(v);
                currentQueue.push_back(v);
                if (observer) {
                    observer->onBFSNeighborInspect(u, v, false);
                    observer->onBFSVertexEnqueued(v, currentQueue, vis);
                }
            } else {
                if (observer) {
                    observer->onBFSNeighborInspect(u, v, true);
                }
            }
        }
    }

    // Step 2: Process any remaining disconnected components
    for (int i = 0; i < V; i++) {
        if (!vis[i]) {
            if (observer) {
                observer->onBFSComponentTransition(i);
            }
            vis[i] = true;
            Q.push(i);
            currentQueue.push_back(i);
            if (observer) {
                observer->onBFSVertexEnqueued(i, currentQueue, vis);
            }

            while (!Q.empty()) {
                int u = Q.front();
                Q.pop();
                currentQueue.erase(currentQueue.begin());
                traversal.push_back(u);

                if (observer) {
                    observer->onBFSVertexDequeued(u, currentQueue, vis);
                }

                for (int v : adj[u]) {
                    if (!vis[v]) {
                        vis[v] = true;
                        Q.push(v);
                        currentQueue.push_back(v);
                        if (observer) {
                            observer->onBFSNeighborInspect(u, v, false);
                            observer->onBFSVertexEnqueued(v, currentQueue, vis);
                        }
                    } else {
                        if (observer) {
                            observer->onBFSNeighborInspect(u, v, true);
                        }
                    }
                }
            }
        }
    }

    if (observer) {
        observer->onBFSTraversalComplete(V, src, traversal, adjSnapshot);
    }

    return traversal;
}

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

    ConsoleObserver obs(true);
    GraphBFS g(vertices, &obs);
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
