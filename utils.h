#pragma once
#include <iostream>
#include <windows.h>
#include <vector>
using namespace std;

// ╔══════════════════════════════════════╗
// ║         COLOR DEFINITIONS            ║
// ╚══════════════════════════════════════╝
// these stay in header since they're just next substitution,not function
#define RESET "\033[0m"
#define BOLD "\033[1m"
#define CYAN "\033[96m"
#define GREEN "\033[92m"
#define YELLOW "\033[93m"
#define RED "\033[91m"
#define BLUE "\033[94m"
#define WHITE "\033[97m"
#define MAGENTA "\033[95m"
#define GRAY "\033[90m"

// ╔══════════════════════════════════════╗
// ║      FUNCTION DECLARATIONS ONLY      ║
// ╚══════════════════════════════════════╝

// Color setup
void enableColors();

// Display functions
void printHeader(const string &title);
void printDivider();
void printPass(int passNum);
void printSwap(int a, int b);
void printNoSwap();

// Array display functions
void printArray(int arr[], int n);
void printArrayHighlight(int arr[], int n, int pos1, int pos2);
void printArraySorted(int arr[], int n, int sortedFrom);

// Statistics aand Complexity
void printComplexity(string best, string average, string worst, string space);
void printStats(int comparisons, int swaps, int passes);

// Control functions
void pause(int ms = 600);
void waitForEnter();
int getValidInt(string prompt, int min, int max);
bool chooseMode();