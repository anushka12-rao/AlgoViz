# AlgoViz — Interactive C++ Algorithm & Data Structure Visualizer

AlgoViz is a modular, terminal-based CLI software engine written in C++ (C++11). It provides interactive execution traces, state transitions, step-by-step partition tracking, and structural tree rendering for foundational computer science algorithms and data structures.

---

## Key Features

* **Modular Systems Architecture:** Decoupled multi-file hierarchy isolating each algorithmic domain, integrated via forward declarations and centralized styling utilities.
* **Interactive Dynamic Visualizations:**
  * **Trees:** Recursive ASCII visualizer for Binary Trees (level-order traversal/structural rendering) and Binary Search Trees (step-by-step search path tracing, value insertion, and node deletion).
  * **Sorting:** Detailed telemetry (comparisons and swaps) with Lomuto partition visualization for QuickSort and divide-and-conquer steps for MergeSort.
  * **Graphs:** Adjacency-list based Breadth-First Search (BFS) and Depth-First Search (DFS) node traversal paths.
  * **Data Structures:** Dynamic pointer mutations for Singly Linked Lists, Stacks (LIFO), and Queues (FIFO).
* **Dual Execution Modes:** Supports **Auto Mode** (animated delays) and **Step Mode** (manual step-through).
* **Zero External Dependencies:** Built entirely with standard library C++ primitives (`<iostream>`, `<vector>`, `<string>`, `<limits>`).

---

## Project Structure

```text
AlgoViz/
├── data_structures/
│   ├── linked_list.cpp
│   ├── queue.cpp
│   └── stack.cpp
├── graphs/
│   ├── BFS.cpp
│   └── DFS.cpp
├── searching/
│   ├── binary_search.cpp
│   └── linear_search.cpp
├── sorting/
│   ├── bubble_sort.cpp
│   ├── insertion_sort.cpp
│   ├── merge_sort.cpp
│   ├── quick_sort.cpp
│   └── selection_sort.cpp
├── trees/
│   ├── binary_tree.cpp
│   └── bst.cpp
├── main.cpp
├── utils.h
├── utils.cpp
├── .gitignore
└── README.md
Algorithmic Complexity ReferenceModuleAlgorithm / StructureTime Complexity (Best)Time Complexity (Avg)Time Complexity (Worst)Space ComplexityTreesBinary Tree (Traversals / Level-Order)O(n)O(n)O(n)O(w) / O(h)TreesBST Insert / Search / DeleteO(log n)O(log n)O(n)O(h)SortingQuick SortO(n log n)O(n log n)O(n^2)O(log n)SortingMerge SortO(n log n)O(n log n)O(n log n)O(n)SortingBubble / Insertion / SelectionO(n) / O(n^2)O(n^2)O(n^2)O(1)SearchingBinary SearchO(1)O(log n)O(log n)O(1)SearchingLinear SearchO(1)O(n)O(n)O(1)GraphsBFS / DFSO(V + E)O(V + E)