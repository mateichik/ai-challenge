# Sea Battle CLI Game

This is a simple command-line interface (CLI) implementation of the classic Sea Battle (Battleship) game, written in JavaScript.

## Gameplay

You play against a CPU opponent. Both players place their ships on a 10x10 grid. Players take turns guessing coordinates to hit the opponent's ships. The first player to sink all of the opponent's ships wins.

- `~` represents water (unknown).
- `S` represents your ships on your board.
- `X` represents a hit (on either board).
- `O` represents a miss (on either board).

## Architecture

This project follows a modular, class-based architecture to separate concerns and improve maintainability. The core components are:

- **`SeaBattleGame`**: The main controller class that orchestrates the entire game flow.
- **`GameLogic`**: Handles the core rules of the game, such as ship placement, hit detection, and win conditions.
- **`GameState`**: Manages the state of the game, including players, boards, and game status.
- **`Player` / `AIPlayer`**: Represent the human and CPU players, managing their ships, guesses, and actions.
- **`Board`**: Represents the game grid and provides methods for interacting with it.
- **`Ship`**: Represents a single ship with its locations and hit status.
- **`GameDisplay`**: Manages all output to the console.
- **`InputHandler`**: Handles all user input from the command line.

## Project Structure

The codebase is organized into the following directories:

- **`/src`**: Contains all the source code for the game, with each class in its own module.
- **`/test`**: Contains all the unit and integration tests for the game logic.
- **`/docs`**: Contains documentation files, including the refactoring strategy.

## How to Run

1.  **Ensure you have Node.js installed.** You can download it from [https://nodejs.org/](https://nodejs.org/).
2.  **Navigate to the project directory** in your terminal.
3.  **Install dependencies** by running:
    ```bash
    npm install
    ```
4.  **Run the game** using the command:
    ```bash
    npm start
    ```
5.  **Follow the prompts** to enter your guesses (e.g., `00` for the top-left corner, `99` for the bottom-right).

## How to Test

To run the automated tests, navigate to the project directory and use the following command:

```bash
npm test
```

Enjoy the game! 