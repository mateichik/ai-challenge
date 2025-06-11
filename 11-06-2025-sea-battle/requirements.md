# Sea Battle Game - Business Requirements Document

**Document Version:** 1.0  
**Date:** November 6, 2025  
**Project:** Sea Battle Console Game  
**Analyst:** Professional Business Analyst  

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview
The Sea Battle Game is a console-based implementation of the classic Battleship game where a human player competes against an intelligent computer opponent. The game provides an engaging tactical experience through strategic guessing and smart AI opponent behavior.

### 1.2 Business Objectives
- Provide an entertaining console-based gaming experience
- Demonstrate intelligent AI gameplay mechanics
- Offer a complete, playable implementation of classic Battleship rules
- Serve as a foundation for potential future enhancements (GUI, multiplayer, etc.)

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Game Setup Requirements

#### 2.1.1 Board Configuration
- **REQ-001:** The game SHALL use a 10x10 grid board for both player and CPU
- **REQ-002:** Rows SHALL be numbered 0-9 from top to bottom
- **REQ-003:** Columns SHALL be numbered 0-9 from left to right
- **REQ-004:** Each cell SHALL be initialized as water ('~' symbol)
- **REQ-005:** The system SHALL maintain two separate boards: player board and opponent board

#### 2.1.2 Ship Configuration
- **REQ-006:** Each player SHALL have exactly 3 ships
- **REQ-007:** Each ship SHALL be exactly 3 cells in length
- **REQ-008:** Ships SHALL be placed either horizontally or vertically (no diagonal placement)
- **REQ-009:** Ships SHALL NOT overlap with other ships
- **REQ-010:** Ships SHALL NOT extend beyond board boundaries
- **REQ-011:** Ships SHALL be placed randomly for both player and CPU at game start

#### 2.1.3 Ship Placement Algorithm
- **REQ-012:** The system SHALL attempt ship placement until all ships are successfully placed
- **REQ-013:** For horizontal ships: starting column SHALL allow full ship length within board
- **REQ-014:** For vertical ships: starting row SHALL allow full ship length within board
- **REQ-015:** The system SHALL detect and prevent ship collisions during placement
- **REQ-016:** Player ships SHALL be visible on player's board (marked as 'S')
- **REQ-017:** CPU ships SHALL remain hidden until hit

### 2.2 User Interface Requirements

#### 2.2.1 Board Display
- **REQ-018:** The system SHALL display both boards side-by-side each turn
- **REQ-019:** Opponent board SHALL be displayed on the left
- **REQ-020:** Player board SHALL be displayed on the right
- **REQ-021:** Column headers SHALL show digits 0-9
- **REQ-022:** Row headers SHALL show digits 0-9
- **REQ-023:** Board title headers SHALL clearly identify "OPPONENT BOARD" and "YOUR BOARD"

#### 2.2.2 Game Symbols
- **REQ-024:** Water cells SHALL display '~' symbol
- **REQ-025:** Player ships SHALL display 'S' symbol on player board
- **REQ-026:** Hit cells SHALL display 'X' symbol
- **REQ-027:** Miss cells SHALL display 'O' symbol
- **REQ-028:** CPU ships SHALL remain invisible until hit

#### 2.2.3 User Input
- **REQ-029:** The system SHALL prompt user with "Enter your guess (e.g., 00): "
- **REQ-030:** User input SHALL be exactly 2 digits (row + column)
- **REQ-031:** Input examples: "00", "34", "99"
- **REQ-032:** The system SHALL accept input through standard console input

### 2.3 Gameplay Mechanics

#### 2.3.1 Turn Sequence
- **REQ-033:** Player SHALL always move first
- **REQ-034:** CPU SHALL move immediately after valid player move
- **REQ-035:** Game SHALL alternate between player and CPU turns until game ends
- **REQ-036:** Invalid player input SHALL NOT trigger CPU turn

#### 2.3.2 Hit Detection
- **REQ-037:** The system SHALL check if guess coordinates match any ship location
- **REQ-038:** On hit: system SHALL mark ship segment as hit and display 'X' on board
- **REQ-039:** On miss: system SHALL display 'O' on board
- **REQ-040:** The system SHALL provide immediate feedback for each guess result

#### 2.3.3 Ship Sinking Logic
- **REQ-041:** A ship SHALL be considered sunk when all segments are hit
- **REQ-042:** The system SHALL notify player when they sink an enemy ship
- **REQ-043:** The system SHALL notify player when CPU sinks their ship
- **REQ-044:** The system SHALL track remaining ship count for both players

### 2.4 CPU Artificial Intelligence

#### 2.4.1 Hunt Mode (Random Search)
- **REQ-045:** CPU SHALL use random coordinate generation when no hits are active
- **REQ-046:** CPU SHALL validate coordinates are within board boundaries
- **REQ-047:** CPU SHALL ensure coordinates haven't been previously guessed
- **REQ-048:** CPU SHALL continue random search until a hit is achieved

#### 2.4.2 Target Mode (Smart Search)
- **REQ-049:** CPU SHALL switch to target mode immediately after hitting a ship
- **REQ-050:** CPU SHALL target all 4 adjacent cells (north, south, east, west) of hit location
- **REQ-051:** CPU SHALL queue adjacent coordinates for systematic targeting
- **REQ-052:** CPU SHALL filter out invalid coordinates (out of bounds, already guessed)
- **REQ-053:** CPU SHALL remove duplicate coordinates from target queue
- **REQ-054:** CPU SHALL return to hunt mode after ship is completely sunk
- **REQ-055:** CPU SHALL clear target queue when ship is sunk

#### 2.4.3 CPU Decision Making
- **REQ-056:** CPU SHALL prioritize queued target coordinates over random guessing
- **REQ-057:** CPU SHALL provide visual feedback showing targeted coordinates
- **REQ-058:** CPU SHALL handle edge cases where target queue becomes empty

### 2.5 Game End Conditions

#### 2.5.1 Victory Conditions
- **REQ-059:** Player wins when all CPU ships are sunk (CPU ship count = 0)
- **REQ-060:** CPU wins when all player ships are sunk (Player ship count = 0)
- **REQ-061:** Game SHALL end immediately when victory condition is met

#### 2.5.2 End Game Actions
- **REQ-062:** System SHALL display congratulations message for player victory
- **REQ-063:** System SHALL display game over message for player defeat
- **REQ-064:** System SHALL display final board state at game end
- **REQ-065:** System SHALL close input interface and terminate gracefully

---

## 3. INPUT VALIDATION REQUIREMENTS

### 3.1 Format Validation
- **REQ-066:** Input MUST be exactly 2 characters long
- **REQ-067:** Both characters MUST be numeric digits (0-9)
- **REQ-068:** System SHALL reject null, empty, or undefined input
- **REQ-069:** System SHALL reject non-numeric characters
- **REQ-070:** System SHALL reject input longer or shorter than 2 characters

### 3.2 Boundary Validation
- **REQ-071:** Row coordinate MUST be between 0-9 inclusive
- **REQ-072:** Column coordinate MUST be between 0-9 inclusive
- **REQ-073:** System SHALL reject coordinates outside valid range

### 3.3 Duplicate Detection
- **REQ-074:** System SHALL maintain history of all player guesses
- **REQ-075:** System SHALL prevent duplicate guesses from player
- **REQ-076:** System SHALL maintain separate guess history for CPU
- **REQ-077:** System SHALL prevent CPU from making duplicate guesses

---

## 4. ERROR HANDLING & EDGE CASES

### 4.1 Input Error Cases
- **EDGE-001:** Empty string input → Display format error message
- **EDGE-002:** Single character input → Display format error message  
- **EDGE-003:** Three or more character input → Display format error message
- **EDGE-004:** Non-numeric input (e.g., "ab", "1a") → Display format error message
- **EDGE-005:** Special characters (e.g., "!@", "--") → Display format error message
- **EDGE-006:** Whitespace input (e.g., " ", "  ") → Display format error message
- **EDGE-007:** Out of bounds coordinates (e.g., "99" on 10x10 board) → Display boundary error

### 4.2 Duplicate Guess Cases
- **EDGE-008:** Player repeats previous guess → Display duplicate warning, allow retry
- **EDGE-009:** Player hits same ship segment twice → Display "already hit" message
- **EDGE-010:** CPU attempts duplicate guess → Automatically retry with new coordinates

### 4.3 Ship Placement Edge Cases
- **EDGE-011:** Ship placement at board edges → Ensure proper boundary checking
- **EDGE-012:** Ship placement with insufficient space → Retry placement algorithm
- **EDGE-013:** All ships overlap in random placement → Continue until valid placement found
- **EDGE-014:** Infinite placement loop prevention → Implementation should handle rare cases

### 4.4 CPU AI Edge Cases
- **EDGE-015:** CPU target queue becomes empty while in target mode → Switch to hunt mode
- **EDGE-016:** CPU hits ship at board edge → Only add valid adjacent coordinates
- **EDGE-017:** CPU hits ship in corner → Handle reduced adjacent coordinate set
- **EDGE-018:** CPU target queue contains only invalid coordinates → Clear queue, switch to hunt
- **EDGE-019:** CPU random guess generation fails repeatedly → Ensure termination mechanism

### 4.5 Game State Edge Cases
- **EDGE-020:** Multiple ships sunk simultaneously (impossible but handle gracefully)
- **EDGE-021:** Game end detection failure → Ensure proper victory condition checking
- **EDGE-022:** Board state corruption → Validate board integrity
- **EDGE-023:** Memory constraints with large guess histories → Consider cleanup mechanisms

---

## 5. USER EXPERIENCE REQUIREMENTS

### 5.1 Feedback Messages
- **UX-001:** Input validation errors SHALL provide clear, actionable guidance
- **UX-002:** Hit/miss feedback SHALL be immediate and obvious
- **UX-003:** Ship sinking notifications SHALL be celebratory/informative
- **UX-004:** CPU turn actions SHALL be visible to maintain engagement
- **UX-005:** Error messages SHALL suggest correct input format

### 5.2 Game Flow
- **UX-006:** Game SHALL start immediately after ship placement
- **UX-007:** Board SHALL be displayed before each player turn
- **UX-008:** Turn transitions SHALL be clearly marked
- **UX-009:** Game progression SHALL be obvious to player

### 5.3 Information Display
- **UX-010:** Remaining ship counts SHALL be implicitly trackable through board state
- **UX-011:** Previous guesses SHALL be visible on boards
- **UX-012:** CPU targeting behavior SHALL be visible for engagement

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance
- **NFR-001:** Game SHALL respond to user input within 100ms
- **NFR-002:** CPU turn SHALL complete within 500ms
- **NFR-003:** Board rendering SHALL be instantaneous for human perception
- **NFR-004:** Memory usage SHALL remain constant during gameplay

### 6.2 Reliability
- **NFR-005:** Game SHALL handle invalid input without crashing
- **NFR-006:** Game SHALL recover gracefully from edge cases
- **NFR-007:** Game logic SHALL be deterministic and repeatable
- **NFR-008:** Random number generation SHALL be properly seeded

### 6.3 Maintainability
- **NFR-009:** Code SHALL be modular and testable
- **NFR-010:** Game logic SHALL be separated from UI logic
- **NFR-011:** Constants SHALL be configurable (board size, ship count, etc.)
- **NFR-012:** Error handling SHALL be comprehensive and logged

### 6.4 Compatibility
- **NFR-013:** Game SHALL run on Node.js environment
- **NFR-014:** Game SHALL work with standard console interfaces
- **NFR-015:** Game SHALL be compatible with readline module requirements

---

## 7. TESTING REQUIREMENTS

### 7.1 Unit Testing
- **TEST-001:** All game logic functions SHALL have unit tests
- **TEST-002:** Input validation SHALL be thoroughly tested
- **TEST-003:** Ship placement algorithm SHALL be tested for edge cases
- **TEST-004:** CPU AI logic SHALL be tested for correctness
- **TEST-005:** Game state management SHALL be tested

### 7.2 Integration Testing
- **TEST-006:** Full game flow SHALL be tested end-to-end
- **TEST-007:** Player vs CPU interaction SHALL be validated
- **TEST-008:** Error scenarios SHALL be tested
- **TEST-009:** Edge cases SHALL be systematically tested

### 7.3 Acceptance Testing
- **TEST-010:** Game SHALL be playable by non-technical users
- **TEST-011:** Victory conditions SHALL be properly triggered
- **TEST-012:** User experience SHALL meet expectations
- **TEST-013:** Performance requirements SHALL be verified

---

## 8. ASSUMPTIONS AND CONSTRAINTS

### 8.1 Assumptions
- Node.js runtime environment is available
- Console/terminal interface is accessible
- User has basic understanding of coordinate systems
- Single-player vs CPU gameplay is sufficient
- ASCII text display is acceptable

### 8.2 Constraints
- Console-only interface (no GUI)
- Single-threaded execution model
- Memory limitations of Node.js environment
- No persistence between game sessions
- No network connectivity required

### 8.3 Future Considerations
- Potential GUI implementation
- Multiplayer capabilities
- Game statistics tracking
- Difficulty level adjustments
- Save/load game functionality

---

## 9. ACCEPTANCE CRITERIA

### 9.1 Primary Success Scenarios
1. **Complete Game Victory**: Player can successfully sink all CPU ships and win
2. **Complete Game Defeat**: CPU can successfully sink all player ships
3. **Error Recovery**: Game continues normally after any input error
4. **AI Functionality**: CPU demonstrates intelligent targeting behavior

### 9.2 Quality Gates
- All unit tests pass with 100% coverage of critical logic
- No crashes during extended gameplay sessions
- Input validation catches all specified edge cases
- Game completion time reasonable for typical play session
- Code meets maintainability standards

---

**Document Approval:**
- Business Analyst: [Signature Required]
- Technical Lead: [Signature Required]  
- QA Lead: [Signature Required]
- Product Owner: [Signature Required]

---

*This document represents the complete business requirements for the Sea Battle Game implementation. Any changes to these requirements must be approved through the standard change control process.* 