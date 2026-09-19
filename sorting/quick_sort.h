#pragma once
#include <vector>
#include "../observer.h"

// Core algorithmic execution decoupled from terminal I/O
void quickSortCore(std::vector<int> &arr, IAlgoObserver &obs, bool autoMode = true);

// Existing CLI visualizer entry point (retained for main.cpp)
void quickSortVisualizer();
