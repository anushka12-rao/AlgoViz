#pragma once
#include <vector>
#include <list>

class IAlgoObserver;

class GraphBFS {
private:
    int V;
    std::list<int> *adj;
    IAlgoObserver *observer;

public:
    explicit GraphBFS(int vertices, IAlgoObserver *obs = nullptr);
    ~GraphBFS();

    // Prevent inadvertent copies to safeguard raw dynamic memory
    GraphBFS(const GraphBFS&) = delete;
    GraphBFS& operator=(const GraphBFS&) = delete;

    void setObserver(IAlgoObserver *obs);
    IAlgoObserver* getObserver() const;

    int getVertexCount() const;
    bool addEdge(int u, int v);
    std::vector<std::vector<int>> getAdjacencyList() const;

    // Core traversal
    std::vector<int> bfs(int src = 0) const;

    // Direct terminal output / inspection
    void printGraph() const;
};

void bfsVisualizer();
