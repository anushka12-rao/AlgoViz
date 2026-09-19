#pragma once
#include <vector>
#include "../observer.h"

// Core algorithmic execution decoupled from terminal I/O
int binarySearchCore(const std::vector<int> &arr, int target, IAlgoObserver &obs, bool autoMode = true);

// Existing CLI visualizer entry point (retained for main.cpp)
void binarySearchVisualizer();
