#include <clocale>
#include <iostream>
#include "utils.h"

using namespace std;

// ╔══════════════════════════════════════╗
// ║          FORWARD DECLARATIONS        ║
// ╚══════════════════════════════════════╝
void sortingMenu();
void searchingMenu();
void dataStructuresMenu();
void treesMenu();
void graphsMenu();

// External function hook from sorting/bubble_sort.cpp
void bubbleSortVisualizer();
void selectionSortVisualizer();
void insertionSortVisualizer();
void mergeSortVisualizer();
void quickSortVisualizer();

void linearSearchVisualizer();
void binarySearchVisualizer();

void stackVisualizer();
void queueVisualizer();
void linkedListVisualizer();

void binaryTreeVisualizer();
void bstVisualizer();

void bfsVisualizer();
void dfsVisualizer();

// ╔══════════════════════════════════════╗
// ║           MAIN MENU                  ║
// ╚══════════════════════════════════════╝
void mainMenu()
{
     while (true)
     {
          system("cls");
          enableColors();

          cout << CYAN << BOLD;
          cout << "\n";
          cout << "+--------------------------------------+\n";
          cout << "|                                      |\n";
          cout << "|       ALGOVIZ - DSA VISUALIZER       |\n";
          cout << "|       Built by Anushka Rao           |\n";
          cout << "|       B.Tech CSE                     |\n";
          cout << "|       University of Lucknow          |\n";
          cout << "|                                      |\n";
          cout << "+--------------------------------------+\n";
          cout << RESET;

          cout << "\n";
          printDivider();
          cout << CYAN << BOLD
               << "SELECT A CATEGORY\n"
               << RESET;
          printDivider();

          cout << GREEN << " 1. Sorting Algorithm\n"
               << RESET;
          cout << YELLOW << " 2. Searching Algorithm\n"
               << RESET;
          cout << BLUE << " 3. Data Structure\n"
               << RESET;
          cout << MAGENTA << " 4. Trees\n"
               << RESET;
          cout << CYAN << " 5. Graphs\n"
               << RESET;
          cout << RED << " 0. Exit\n"
               << RESET;

          printDivider();

          cin.clear();

          int choice = getValidInt(" Enter your choice: ", 0, 5);

          switch (choice)
          {
          case 1:
               sortingMenu();
               break;
          case 2:
               searchingMenu();
               break;
          case 3:
               dataStructuresMenu();
               break;
          case 4:
               treesMenu();
               break;
          case 5:
               graphsMenu();
               break;
          case 0:
               cout << CYAN << BOLD
                    << "\n Thankyou for using Algoviz!\n"
                    << " Built by Anushka Rao\n"
                    << RESET << "\n";
               return;
          }
     }
}

// ╔══════════════════════════════════════╗
// ║        SORTING MENU                  ║
// ╚══════════════════════════════════════╝
void sortingMenu()
{
     while (true)
     {
          system("cls");
          cout << "\n";
          printDivider();
          cout << GREEN << BOLD
               << "SORTING ALGORITHM\n"
               << RESET;
          printDivider();
          cout << GREEN << " 1. Bubble Sort\n"
               << RESET;
          cout << GREEN << " 2. Selection Sort\n"
               << RESET;
          cout << GREEN << " 3. Insertion Sort\n"
               << RESET;
          cout << GREEN << " 4. Merge Sort\n"
               << RESET;
          cout << GREEN << " 5. Quick Sort\n"
               << RESET;
          cout << RED << " 0. Back\n"
               << RESET;
          printDivider();

          int choice = getValidInt(" Enter your choice: ", 0, 5);
          if (choice == 0)
               return;

          switch (choice)
          {
          case 1:
               // Successfully wired to the bubble_sort.cpp module!
               bubbleSortVisualizer();
               break;
          case 2:
               // Successfully wired to the selection_sort.cpp module!
               selectionSortVisualizer();
               break;
          case 3:
               // Successfully wired to the insertion_sort.cpp module!
               insertionSortVisualizer();
               break;
          case 4:
               // Successfully wired to the merge_sort.cpp module!
               mergeSortVisualizer();
               break;
          case 5:
               // Successfully wired to the quick_sort.cpp module!
               quickSortVisualizer();
               break;
          }
     }
}
// ╔══════════════════════════════════════╗
// ║        SEARCHING MENU                ║
// ╚══════════════════════════════════════╝
void searchingMenu()
{
     while (true)
     {
          system("cls");
          cout << "\n";
          printDivider();
          cout << YELLOW << BOLD
               << " SEARCHING ALGORITHM\n"
               << RESET;
          printDivider();
          cout << YELLOW << " 1. Linear Search\n"
               << RESET;
          cout << YELLOW << " 2. Binary Search\n"
               << RESET;
          cout << RED << " 0. Back\n"
               << RESET;
          printDivider();

          int choice = getValidInt(" Enter your choice: ", 0, 2);
          if (choice == 0)
               return;
          switch (choice)
          {
          case 1:
               // Successfully wired to the linear_search.cpp module!
               linearSearchVisualizer();
               break;
          case 2:
               // Successfully wired to the linear_search.cpp module!
               binarySearchVisualizer();
               break;
          }
     }
}
// ╔══════════════════════════════════════╗
// ║        DATA STRUCTURES MENU          ║
// ╚══════════════════════════════════════╝
void dataStructuresMenu()
{
     while (true)
     {
          system("cls");
          cout << "\n";
          printDivider();
          cout << BLUE << BOLD
               << " Data Structure\n"
               << RESET;
          printDivider();
          cout << BLUE << " 1. Stack\n"
               << RESET;
          cout << BLUE << " 2. Queue\n"
               << RESET;
          cout << BLUE << " 3. Linked List\n"
               << RESET;
          cout << BLUE << " 0. Back\n"
               << RESET;
          printDivider();

          int choice = getValidInt(" Enter your choice:", 0, 3);
          if (choice == 0)
               return;
          switch (choice)
          {
          case 1:
               // Successfully wired to the data_structure/stack.cpp module!
               stackVisualizer();
               break;
          case 2:
               // Successfully wired to the data_structure/queue.cpp module!
               queueVisualizer();
               break;
          case 3:
               // Successfully wired to the data_structure/linked_List.cpp module!
               linkedListVisualizer();
               break;
          }
     }
}

// ╔══════════════════════════════════════╗
// ║        TREES MENU                    ║
// ╚══════════════════════════════════════╝
void treesMenu()
{
     while (true)
     {
          system("cls");
          cout << "\n";
          printDivider();
          cout << MAGENTA << BOLD
               << "TREES\n"
               << RESET;
          printDivider();
          cout << MAGENTA << " 1. Binary Tree\n"
               << RESET;
          cout << MAGENTA << " 2. BST\n"
               << RESET;
          cout << RED << " 0. Back\n"
               << RESET;
          printDivider();

          int choice = getValidInt(" Enter your choice: ", 0, 2);

          if (choice == 0)
               return;
          switch (choice)
          {
          case 1:
               // Successfully wired to the data_structure/binary_tree.cpp module!
               binaryTreeVisualizer();
               break;
          case 2:
               // Successfully wired to the data_structure/bst.cpp module!
               bstVisualizer();
               break;
          }
     }
}
// ╔══════════════════════════════════════╗
// ║        GRAPHS MENU                   ║
// ╚══════════════════════════════════════╝
void graphsMenu()
{
     while (true)
     {
          system("cls");
          cout << "\n";
          printDivider();
          cout << CYAN << BOLD
               << " GRAPHS\n"
               << RESET;
          printDivider();
          cout << CYAN << " 1. BFS\n"
               << RESET;
          cout << CYAN << " 2. DFS\n"
               << RESET;
          cout << RED << " 0. Back\n"
               << RESET;
          printDivider();

          int choice = getValidInt(" Enter your choice: ", 0, 2);

          if (choice == 0)
               return;
          switch (choice)
          {
          case 1:
               // Successfully wired to the data_structure/bfs.cpp module!
               bfsVisualizer();
               break;
          case 2:
               // Successfully wired to the data_structure/bfs.cpp module!
               dfsVisualizer();
               break;
          }
     }
}
// ╔══════════════════════════════════════╗
// ║           MAIN FUNCTION              ║
// ╚══════════════════════════════════════╝
int main()
{
     setlocale(LC_ALL, "");
     enableColors();
     mainMenu();
     return 0;
}
