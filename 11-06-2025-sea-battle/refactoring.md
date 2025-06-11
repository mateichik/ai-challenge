# Sea Battle Game - Refactoring Strategy

**Document Version:** 1.0  
**Date:** November 6, 2025  
**Refactoring Scope:** Complete modernization and architectural restructuring  
**Target:** Modern ES6+ JavaScript with clean architecture  

---

## REFACTORING OBJECTIVES

### Primary Goals
1. **Eliminate Global State** - Move all global variables into proper encapsulation
2. **Separate Concerns** - Split game logic, UI, and utilities into distinct modules
3. **Architectural Pattern** - Implement MVC or modular class-based architecture
4. **Modernize JavaScript** - Upgrade to ES6+ features (classes, modules, arrow functions, etc.)
5. **Enhance Maintainability** - Improve naming, structure, and code style

### Success Criteria
- Zero global variables
- Complete unit test coverage possible
- Clear separation between game logic and UI
- Modern JavaScript standards compliance
- Improved readability and maintainability

---

## PHASE 1: PREPARATION FOR TESTABILITY

### Step 1.1: Extract Constants
- **Action:** Create `GameConfig` object to hold all configuration constants
- **Details:** 
  - Move `boardSize`, `numShips`, `shipLength` into single config object
  - Place at top of file as `const GameConfig = { BOARD_SIZE: 10, NUM_SHIPS: 3, SHIP_LENGTH: 3 }`
  - Update all references to use `GameConfig.BOARD_SIZE` instead of `boardSize`

### Step 1.2: Identify Pure Functions
- **Action:** Mark functions that don't depend on global state
- **Details:**
  - Add comments `// PURE FUNCTION` above functions like `isSunk()`
  - Identify functions that only use parameters and return values
  - Mark functions that modify global state as `// STATEFUL FUNCTION`

### Step 1.3: Extract Utility Functions
- **Action:** Create separate section for utility functions
- **Details:**
  - Move coordinate validation functions to utilities section
  - Add `// === UTILITY FUNCTIONS ===` section separator
  - Group functions like `isValidAndNewGuess()` together

### Step 1.4: Replace var with let/const
- **Action:** Replace all `var` declarations with appropriate `let` or `const`
- **Details:**
  - Use `const` for values that never change (like function references)
  - Use `let` for variables that are reassigned
  - Replace `var i` in for loops with `let i`
  - Replace `var` in function parameters where applicable

### Step 1.5: Create Testable Function Signatures
- **Action:** Modify functions to accept dependencies as parameters
- **Details:**
  - Update `createBoard()` to accept size parameter
  - Update `isSunk()` to accept ship and shipLength parameters
  - Update `processPlayerGuess()` to accept board state as parameters
  - Keep original functions for backward compatibility temporarily

### Step 1.6: Extract Game State Object
- **Action:** Create `GameState` class to hold current game state
- **Details:**
  - Create `class GameState { constructor() { ... } }`
  - Move all global state variables into this class
  - Add getter/setter methods for accessing state
  - Initialize state in constructor

### Step 1.7: Write Initial Unit Tests
- **Action:** Create comprehensive unit test suite for pure functions
- **Details:**
  - Test all utility functions (coordinate validation, etc.)
  - Test pure game logic functions (ship sinking, hit detection)
  - Test edge cases identified in requirements.md
  - Ensure 100% coverage of testable functions

---

## PHASE 2: ARCHITECTURAL RESTRUCTURING

### Step 2.1: Create Game Logic Module
- **Action:** Extract all game logic into separate `GameLogic` class
- **Details:**
  - Create `class GameLogic { ... }`
  - Move ship placement logic into `placeShips()` method
  - Move hit detection into `processHit()` method
  - Move victory condition checking into `checkGameEnd()` method
  - Make all methods accept state as parameter instead of using globals

### Step 2.2: Create Board Module
- **Action:** Create `Board` class to manage board state and operations
- **Details:**
  - Create `class Board { constructor(size) { ... } }`
  - Move board creation logic into constructor
  - Add methods: `getCell()`, `setCell()`, `isValidCoordinate()`
  - Add `render()` method for board display logic
  - Encapsulate board array as private property

### Step 2.3: Create Ship Module
- **Action:** Create `Ship` class to represent individual ships
- **Details:**
  - Create `class Ship { constructor(locations) { ... } }`
  - Move ship-specific logic into class methods
  - Add methods: `hit(location)`, `isSunk()`, `getLocations()`
  - Encapsulate hits array and locations array

### Step 2.4: Create Player Module
- **Action:** Create `Player` class to represent player state and actions
- **Details:**
  - Create `class Player { constructor(name, isHuman = true) { ... } }`
  - Add properties: ships array, guesses array, board
  - Add methods: `makeGuess()`, `receiveHit()`, `hasShipsRemaining()`
  - Separate human player logic from CPU player logic

### Step 2.5: Create AI Module
- **Action:** Create `AIPlayer` class extending `Player`
- **Details:**
  - Create `class AIPlayer extends Player { ... }`
  - Move CPU targeting logic into `calculateNextMove()` method
  - Implement hunt/target modes as class methods
  - Encapsulate AI state (mode, target queue) as private properties

### Step 2.6: Create Game Controller
- **Action:** Create main `SeaBattleGame` class to orchestrate gameplay
- **Details:**
  - Create `class SeaBattleGame { constructor() { ... } }`
  - Initialize players, game logic, and UI components
  - Implement game loop as `async playGame()` method
  - Handle turn management and game state transitions

---

## PHASE 3: UI SEPARATION

### Step 3.1: Create Display Module
- **Action:** Extract all console output into `GameDisplay` class
- **Details:**
  - Create `class GameDisplay { ... }`
  - Move `printBoard()` logic into `renderBoards()` method
  - Add methods: `showMessage()`, `showError()`, `showGameEnd()`
  - Remove all `console.log()` calls from game logic

### Step 3.2: Create Input Handler Module
- **Action:** Create `InputHandler` class for user input management
- **Details:**
  - Create `class InputHandler { constructor() { ... } }`
  - Move readline interface setup into class
  - Add `async getPlayerGuess()` method returning Promise
  - Add input validation methods
  - Handle all user interaction through this class

### Step 3.3: Implement Promise-based Input
- **Action:** Convert callback-based input to Promise-based
- **Details:**
  - Replace `rl.question()` callback with Promise wrapper
  - Update game loop to use `async/await` pattern
  - Handle input validation asynchronously
  - Improve error handling with try/catch blocks

### Step 3.4: Separate UI from Game Logic
- **Action:** Remove all UI dependencies from core game classes
- **Details:**
  - Game logic classes should not call `console.log()`
  - Use event system or callback pattern for UI updates
  - Game logic returns result objects instead of printing messages
  - UI layer interprets results and displays appropriate messages

---

## PHASE 4: MODERN JAVASCRIPT FEATURES

### Step 4.1: Convert to ES6 Classes
- **Action:** Replace all function-based objects with ES6 classes
- **Details:**
  - Use `class` keyword for all major components
  - Implement proper constructors with parameter validation
  - Use private fields (# syntax) where appropriate
  - Add static methods for utility functions

### Step 4.2: Implement Arrow Functions
- **Action:** Replace regular functions with arrow functions where appropriate
- **Details:**
  - Use arrow functions for callbacks and short utility functions
  - Keep regular functions for methods that need `this` binding
  - Use arrow functions in array methods (`map`, `filter`, `forEach`)
  - Maintain readability - don't force arrow functions everywhere

### Step 4.3: Add ES6+ Features
- **Action:** Implement modern JavaScript features throughout codebase
- **Details:**
  - Use destructuring assignment for object properties
  - Use template literals for string interpolation
  - Implement default parameters in functions
  - Use spread operator for array operations
  - Add optional chaining where beneficial

### Step 4.4: Implement Modules
- **Action:** Convert to ES6 module system
- **Details:**
  - Add `export` statements to all classes
  - Create separate files for each major class
  - Use `import` statements to include dependencies
  - Create main entry point file that imports and orchestrates modules

### Step 4.5: Add Async/Await Pattern
- **Action:** Implement async/await for all asynchronous operations
- **Details:**
  - Convert Promise chains to async/await syntax
  - Add proper error handling with try/catch
  - Make game loop asynchronous for better user experience
  - Handle input operations asynchronously

---

## PHASE 5: CODE QUALITY IMPROVEMENTS

### Step 5.1: Implement Consistent Naming Conventions
- **Action:** Standardize all variable and function names
- **Details:**
  - Use camelCase for variables and methods
  - Use PascalCase for class names
  - Use UPPER_SNAKE_CASE for constants
  - Ensure names are descriptive and meaningful
  - Remove abbreviations and unclear names

### Step 5.2: Add JSDoc Comments
- **Action:** Document all public methods and classes
- **Details:**
  - Add JSDoc comments for all public methods
  - Document parameter types and return values
  - Add usage examples for complex methods
  - Document class purposes and relationships

### Step 5.3: Implement Error Handling
- **Action:** Add comprehensive error handling throughout
- **Details:**
  - Add parameter validation to all public methods
  - Implement custom error classes for game-specific errors
  - Add error boundaries for UI operations
  - Ensure graceful degradation for edge cases

### Step 5.4: Add Type Checking (Optional)
- **Action:** Consider adding JSDoc type annotations or TypeScript
- **Details:**
  - Add type annotations to method signatures
  - Define interfaces for game state objects
  - Add runtime type checking for critical operations
  - Consider migration path to TypeScript if needed

### Step 5.5: Optimize Performance
- **Action:** Implement performance optimizations
- **Details:**
  - Cache frequently accessed properties
  - Optimize board rendering for large displays
  - Minimize object creation in game loops
  - Add performance monitoring for critical paths

---

## PHASE 6: TESTING AND VALIDATION

### Step 6.1: Complete Unit Test Coverage
- **Action:** Achieve 100% unit test coverage for game logic
- **Details:**
  - Test all public methods of all classes
  - Test edge cases identified in requirements.md
  - Test error conditions and boundary cases
  - Mock dependencies for isolated testing

### Step 6.2: Add Integration Tests
- **Action:** Test component interactions and game flow
- **Details:**
  - Test complete game scenarios (win/lose)
  - Test player vs AI interactions
  - Test UI component integration
  - Test error recovery scenarios

### Step 6.3: Add End-to-End Tests
- **Action:** Test complete user workflows
- **Details:**
  - Simulate complete game sessions
  - Test input validation flows
  - Test game restart and reset functionality
  - Validate all requirements from requirements.md

### Step 6.4: Performance Testing
- **Action:** Validate performance requirements
- **Details:**
  - Test response times for user inputs
  - Test memory usage during extended gameplay
  - Test AI decision-making performance
  - Validate against NFR requirements

---

## PHASE 7: FINAL CLEANUP

### Step 7.1: Remove Legacy Code
- **Action:** Clean up temporary compatibility code
- **Details:**
  - Remove old function implementations kept for compatibility
  - Clean up commented-out code
  - Remove temporary debugging code
  - Eliminate dead code paths

### Step 7.2: Optimize File Structure
- **Action:** Organize files into logical directory structure
- **Details:**
  - Create `/src` directory for source code
  - Create `/tests` directory for test files
  - Create `/docs` directory for documentation
  - Add proper `package.json` with dependencies

### Step 7.3: Add Build Process
- **Action:** Implement modern build and deployment process
- **Details:**
  - Add bundling for production deployment
  - Add linting with ESLint configuration
  - Add formatting with Prettier
  - Add pre-commit hooks for code quality

### Step 7.4: Final Documentation
- **Action:** Complete all documentation and examples
- **Details:**
  - Update README with new architecture
  - Add API documentation for all classes
  - Create usage examples and tutorials
  - Document deployment and development setup

---

## RISK MITIGATION

### Technical Risks
- **Breaking Changes:** Maintain backward compatibility during transition
- **Performance Impact:** Monitor performance at each phase
- **Testing Complexity:** Start testing early and incrementally

### Process Risks
- **Scope Creep:** Stick to defined phases and objectives
- **Time Overrun:** Prioritize core functionality over nice-to-have features
- **Quality Issues:** Maintain high test coverage throughout

---

## ESTIMATED EFFORT

### Phase Breakdown
- **Phase 1 (Testability):** 8-12 hours
- **Phase 2 (Architecture):** 12-16 hours  
- **Phase 3 (UI Separation):** 6-8 hours
- **Phase 4 (Modernization):** 8-10 hours
- **Phase 5 (Quality):** 6-8 hours
- **Phase 6 (Testing):** 10-12 hours
- **Phase 7 (Cleanup):** 4-6 hours

**Total Estimated Effort:** 54-72 hours

---

## SUCCESS METRICS

### Code Quality Metrics
- Zero global variables
- 100% unit test coverage
- Zero linting errors
- All requirements.md items satisfied

### Architecture Metrics  
- Clear separation of concerns achieved
- Single responsibility principle followed
- Dependency injection implemented
- Modular design with low coupling

### Modern JavaScript Compliance
- ES6+ features utilized throughout
- Consistent coding standards applied
- Async/await pattern implemented
- Module system properly configured

---

*This refactoring strategy provides a comprehensive roadmap for transforming the Sea Battle game into a modern, maintainable, and testable JavaScript application while preserving all existing functionality.* 