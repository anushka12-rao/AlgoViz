#include "json_parser.h"
#include "json_observer.h"

// Domain Headers (Single Source of Truth)
#include "../sorting/bubble_sort.h"
#include "../sorting/selection_sort.h"
#include "../sorting/insertion_sort.h"
#include "../sorting/merge_sort.h"
#include "../sorting/quick_sort.h"
#include "../searching/linear_search.h"
#include "../searching/binary_search.h"
#include "../data_structures/stack.h"
#include "../data_structures/queue.h"
#include "../data_structures/linked_list.h"
#include "../trees/binary_tree.h"
#include "../trees/bst.h"
#include "../graphs/BFS.h"
#include "../graphs/DFS.h"

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;
using namespace algoviz;

static string outputError(const string &msg, int exitCode = 0) {
    (void)exitCode;
    ostringstream ss;
    ss << "{\n"
       << "  \"success\": false,\n"
       << "  \"error\": \"" << JsonObserver::escapeJson(msg) << "\",\n"
       << "  \"total_steps\": 0,\n"
       << "  \"events\": []\n"
       << "}\n";
    return ss.str();
}

int main(int argc, char* argv[]) {
    string inputStr;

    // Handle command line arguments or standard input
    if (argc >= 3 && string(argv[1]) == "--json") {
        inputStr = argv[2];
    } else if (argc >= 3 && string(argv[1]) == "--file") {
        ifstream f(argv[2]);
        if (!f.is_open()) {
            cout << outputError("Cannot open input file: " + string(argv[2]));
            return 1;
        }
        stringstream buf;
        buf << f.rdbuf();
        inputStr = buf.str();
    } else if (argc == 2 && string(argv[1]) != "--help" && string(argv[1]) != "-h") {
        inputStr = argv[1];
    } else {
        // Read from standard input until EOF
        stringstream buf;
        buf << cin.rdbuf();
        inputStr = buf.str();
    }

    if (inputStr.empty()) {
        cout << outputError("Empty execution request");
        return 1;
    }

    JsonValue root;
    try {
        root = JsonParser::parse(inputStr);
    } catch (const exception &e) {
        cout << outputError("JSON parse error: " + string(e.what()));
        return 1;
    }

    if (!root.isObject()) {
        cout << outputError("Root JSON must be an object");
        return 1;
    }

    string algo = root["algorithm"].getString();
    if (algo.empty()) {
        cout << outputError("Missing or empty 'algorithm' identifier");
        return 1;
    }

    JsonValue input = root["input"];
    JsonObserver obs;

    string category;
    ostringstream finalResultSs;
    finalResultSs << "{}";

    // ------------------------------------------------------------------------
    // SORTING ALGORITHMS
    // ------------------------------------------------------------------------
    if (algo == "bubble_sort" || algo == "selection_sort" || algo == "insertion_sort" ||
        algo == "merge_sort" || algo == "quick_sort") {
        category = "sorting";

        if (!input.hasKey("array")) {
            cout << outputError("Sorting input requires 'array' field");
            return 1;
        }

        vector<int> arr = input["array"].getIntArray();
        if (arr.size() > 50) {
            cout << outputError("Array size exceeds maximum safety limit of 50 elements");
            return 1;
        }

        vector<int> arrCopy = arr;

        if (algo == "bubble_sort") {
            bubbleSortCore(arrCopy, obs, true);
        } else if (algo == "selection_sort") {
            selectionSortCore(arrCopy, obs, true);
        } else if (algo == "insertion_sort") {
            insertionSortCore(arrCopy, obs, true);
        } else if (algo == "merge_sort") {
            mergeSortCore(arrCopy, obs, true);
        } else if (algo == "quick_sort") {
            quickSortCore(arrCopy, obs, true);
        }

        finalResultSs.str("");
        finalResultSs << "{\"final_array\": [";
        for (size_t i = 0; i < arrCopy.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << arrCopy[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // SEARCHING ALGORITHMS
    // ------------------------------------------------------------------------
    else if (algo == "linear_search" || algo == "binary_search") {
        category = "searching";

        if (!input.hasKey("array") || !input.hasKey("target")) {
            cout << outputError("Searching input requires 'array' and 'target' fields");
            return 1;
        }

        vector<int> arr = input["array"].getIntArray();
        int target = input["target"].getInt();
        if (arr.size() > 50) {
            cout << outputError("Array size exceeds maximum safety limit of 50 elements");
            return 1;
        }

        int resultIdx = -1;
        if (algo == "linear_search") {
            resultIdx = linearSearchCore(arr, target, obs, true);
        } else if (algo == "binary_search") {
            vector<int> searchArr = arr;
            if (!is_sorted(searchArr.begin(), searchArr.end())) {
                sort(searchArr.begin(), searchArr.end());
            }
            resultIdx = binarySearchCore(searchArr, target, obs, true);
        }

        finalResultSs.str("");
        finalResultSs << "{\"result_index\": " << resultIdx << ", \"found\": " << (resultIdx != -1 ? "true" : "false") << "}";
    }
    // ------------------------------------------------------------------------
    // DATA STRUCTURES: STACK
    // ------------------------------------------------------------------------
    else if (algo == "stack") {
        category = "data_structures";
        Stack st(&obs);

        if (input.hasKey("elements")) {
            vector<int> initElements = input["elements"].getIntArray();
            for (int val : initElements) {
                st.push(val);
            }
        }

        if (input.hasKey("operations")) {
            const auto &ops = input["operations"].getArray();
            for (const auto &opItem : ops) {
                string op = opItem["op"].getString();
                if (op == "push") {
                    st.push(opItem["val"].getInt());
                } else if (op == "pop") {
                    st.pop();
                } else if (op == "top") {
                    st.notifyTop();
                } else if (op == "empty") {
                    st.notifyEmptyCheck();
                } else if (op == "clear") {
                    st.clear();
                }
            }
        }

        const auto &elems = st.getElements();
        finalResultSs.str("");
        finalResultSs << "{\"size\": " << st.size() << ", \"elements\": [";
        for (size_t i = 0; i < elems.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << elems[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // DATA STRUCTURES: QUEUE
    // ------------------------------------------------------------------------
    else if (algo == "queue") {
        category = "data_structures";
        Queue q(&obs);

        if (input.hasKey("elements")) {
            vector<int> initElements = input["elements"].getIntArray();
            for (int val : initElements) {
                q.push(val);
            }
        }

        if (input.hasKey("operations")) {
            const auto &ops = input["operations"].getArray();
            for (const auto &opItem : ops) {
                string op = opItem["op"].getString();
                if (op == "push") {
                    q.push(opItem["val"].getInt());
                } else if (op == "pop") {
                    q.pop();
                } else if (op == "front") {
                    q.notifyFront();
                } else if (op == "empty") {
                    q.notifyEmptyCheck();
                } else if (op == "clear") {
                    q.clear();
                }
            }
        }

        vector<int> elems = q.toVector();
        finalResultSs.str("");
        finalResultSs << "{\"size\": " << q.size() << ", \"elements\": [";
        for (size_t i = 0; i < elems.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << elems[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // DATA STRUCTURES: LINKED LIST
    // ------------------------------------------------------------------------
    else if (algo == "linked_list") {
        category = "data_structures";
        List lst(&obs);

        if (input.hasKey("elements")) {
            vector<int> initElements = input["elements"].getIntArray();
            for (int val : initElements) {
                lst.push_back(val);
            }
        }

        if (input.hasKey("operations")) {
            const auto &ops = input["operations"].getArray();
            for (const auto &opItem : ops) {
                string op = opItem["op"].getString();
                if (op == "push_front") {
                    lst.push_front(opItem["val"].getInt());
                } else if (op == "push_back") {
                    lst.push_back(opItem["val"].getInt());
                } else if (op == "pop_front") {
                    lst.pop_front();
                } else if (op == "pop_back") {
                    lst.pop_back();
                } else if (op == "search") {
                    lst.notifySearch(opItem["val"].getInt());
                } else if (op == "clear") {
                    lst.clear();
                }
            }
        }

        vector<int> elems = lst.toVector();
        finalResultSs.str("");
        finalResultSs << "{\"size\": " << lst.size() << ", \"elements\": [";
        for (size_t i = 0; i < elems.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << elems[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // TREES: BINARY TREE
    // ------------------------------------------------------------------------
    else if (algo == "binary_tree") {
        category = "trees";
        BinaryTree bt(&obs);

        if (input.hasKey("preorder")) {
            vector<int> preorder = input["preorder"].getIntArray();
            bt.buildFromPreorder(preorder);
        } else if (input.hasKey("insertions")) {
            const auto &ins = input["insertions"].getArray();
            for (const auto &item : ins) {
                int parentVal = item["parent"].getInt();
                int newVal = item["val"].getInt();
                string sideStr = item["side"].getString("L");
                char side = (sideStr == "R" || sideStr == "r") ? 'R' : 'L';
                bt.insertManual(parentVal, newVal, side);
            }
        }

        if (input.hasKey("operations")) {
            const auto &ops = input["operations"].getArray();
            for (const auto &opItem : ops) {
                string op = opItem["op"].getString();
                if (op == "inorder") bt.notifyInorder();
                else if (op == "preorder") bt.notifyPreorder();
                else if (op == "postorder") bt.notifyPostorder();
                else if (op == "level_order") bt.notifyLevelOrder();
                else if (op == "metrics") bt.notifyMetrics();
                else if (op == "clear") bt.clear();
            }
        } else {
            // Default comprehensive notifications
            bt.notifyInorder();
            bt.notifyPreorder();
            bt.notifyPostorder();
            bt.notifyLevelOrder();
            bt.notifyMetrics();
        }

        vector<int> in = bt.getInorder();
        finalResultSs.str("");
        finalResultSs << "{\"count\": " << bt.count() << ", \"height\": " << bt.height()
                      << ", \"sum\": " << bt.sum() << ", \"inorder\": [";
        for (size_t i = 0; i < in.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << in[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // TREES: BST
    // ------------------------------------------------------------------------
    else if (algo == "bst") {
        category = "trees";
        BST bst(&obs);

        if (input.hasKey("values")) {
            vector<int> vals = input["values"].getIntArray();
            int dupCount = 0;
            bst.insertBatch(vals, dupCount);
        }

        if (input.hasKey("search_target")) {
            int tar = input["search_target"].getInt();
            vector<string> path;
            bool found = bst.search(tar, path);
            bst.notifySearch(tar, found, path);
        }

        if (input.hasKey("delete_target")) {
            int tar = input["delete_target"].getInt();
            bool deleted = bst.remove(tar);
            bst.notifyDelete(tar, deleted);
        }

        if (input.hasKey("operations")) {
            const auto &ops = input["operations"].getArray();
            for (const auto &opItem : ops) {
                string op = opItem["op"].getString();
                if (op == "insert") {
                    bst.insert(opItem["val"].getInt());
                } else if (op == "search") {
                    int tar = opItem["val"].getInt();
                    vector<string> path;
                    bool found = bst.search(tar, path);
                    bst.notifySearch(tar, found, path);
                } else if (op == "delete") {
                    int tar = opItem["val"].getInt();
                    bool del = bst.remove(tar);
                    bst.notifyDelete(tar, del);
                } else if (op == "clear") {
                    bst.clear();
                } else if (op == "sorted") {
                    bst.notifySorted();
                }
            }
        } else {
            bst.notifySorted();
        }

        vector<int> in = bst.getInorder();
        finalResultSs.str("");
        finalResultSs << "{\"size\": " << bst.size() << ", \"inorder\": [";
        for (size_t i = 0; i < in.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << in[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // GRAPHS: BFS
    // ------------------------------------------------------------------------
    else if (algo == "bfs") {
        category = "graphs";
        int vertices = input["vertices"].getInt(5);
        if (vertices < 0 || vertices > 30) {
            cout << outputError("Graph vertex count must be between 0 and 30");
            return 1;
        }

        GraphBFS g(vertices, &obs);

        if (input.hasKey("edges")) {
            const auto &edges = input["edges"].getArray();
            for (const auto &edgeItem : edges) {
                if (edgeItem.isArray() && edgeItem.getArray().size() >= 2) {
                    int u = edgeItem[0].getInt();
                    int v = edgeItem[1].getInt();
                    g.addEdge(u, v);
                }
            }
        }

        int src = input["src"].getInt(0);
        vector<int> traversal = g.bfs(src);

        finalResultSs.str("");
        finalResultSs << "{\"vertices\": " << vertices << ", \"traversal\": [";
        for (size_t i = 0; i < traversal.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << traversal[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // GRAPHS: DFS
    // ------------------------------------------------------------------------
    else if (algo == "dfs") {
        category = "graphs";
        int vertices = input["vertices"].getInt(5);
        if (vertices < 0 || vertices > 30) {
            cout << outputError("Graph vertex count must be between 0 and 30");
            return 1;
        }

        GraphDFS g(vertices, &obs);

        if (input.hasKey("edges")) {
            const auto &edges = input["edges"].getArray();
            for (const auto &edgeItem : edges) {
                if (edgeItem.isArray() && edgeItem.getArray().size() >= 2) {
                    int u = edgeItem[0].getInt();
                    int v = edgeItem[1].getInt();
                    g.addEdge(u, v);
                }
            }
        }

        int src = input["src"].getInt(0);
        vector<int> traversal = g.dfs(src);

        finalResultSs.str("");
        finalResultSs << "{\"vertices\": " << vertices << ", \"traversal\": [";
        for (size_t i = 0; i < traversal.size(); ++i) {
            finalResultSs << (i > 0 ? "," : "") << traversal[i];
        }
        finalResultSs << "]}";
    }
    // ------------------------------------------------------------------------
    // UNKNOWN ALGORITHM (SAFETY WHITELIST)
    // ------------------------------------------------------------------------
    else {
        cout << outputError("Unknown or unsupported algorithm identifier: " + algo);
        return 1;
    }

    // Assemble final response
    ostringstream out;
    out << "{\n";
    out << "  \"success\": true,\n";
    out << "  \"algorithm\": \"" << JsonObserver::escapeJson(algo) << "\",\n";
    out << "  \"category\": \"" << JsonObserver::escapeJson(category) << "\",\n";
    out << "  \"total_steps\": " << obs.getEvents().size() << ",\n";
    out << "  \"final_result\": " << finalResultSs.str() << ",\n";
    out << "  \"events\": " << obs.serializeEvents() << "\n";
    out << "}\n";

    cout << out.str();
    return 0;
}
