#pragma once
#include <vector>
#include <list>

class IAlgoObserver;

class GraphDFS {
private:
    int V;
    std::list<int> *adj;
    IAlgoObserver *observer;

    void dfsHelper(int u, std::vector<bool> &vis, std::vector<int> &traversal, std::vector<int> &callStack) const;

public:
    explicit GraphDFS(int vertices, IAlgoObserver *obs = nullptr);
    ~GraphDFS();

    // Prevent inadvertent copies to safeguard raw dynamic memory
    GraphDFS(const GraphDFS&) = delete;
    GraphDFS& operator=(const GraphDFS&) = delete;

    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    int getVertexCount() const;
    bool addEdge(int u, int v);
    std::vector<std::vector<int>> getAdjacencyList() const;

    // Core traversal
    std::vector<int> dfs(int src = 0) const;

    // Direct terminal output / inspection
    void printGraph() const;
};

void dfsVisualizer();
