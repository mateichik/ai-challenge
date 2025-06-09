<img src="enigma.png" alt="Broken Enigma Machine" width="300"/>

# Enigma Machine CLI

enigma.js contains a simplified command-line Enigma machine implementation. The Enigma was a rotor-based cipher device used for secure communication in the early 20th century.

## Usage

You can use the CLI to encrypt or decrypt messages using a configurable Enigma setup (rotors, plugboard, reflector).

## How to Run

1. **Ensure you have Node.js installed.**
2. **Navigate to the directory with enigma.js** in your terminal.
3. **Run the program** using:
   ```bash
   node enigma.js
   ```
4. **Follow the prompts** to enter your message and configuration.

## Detailed Instructions

When you run the program, you will be prompted for several configuration options:

### 1. Enter message
- Type the message you want to encrypt or decrypt. Only A-Z letters are processed; other characters are passed through unchanged.

### 2. Rotor positions (e.g. `0 0 0`)
- Enter three numbers (space-separated), each from 0 to 25, representing the initial position of each rotor (left to right). For example, `0 0 0` means all rotors start at 'A'.

### 3. Ring settings (e.g. `0 0 0`)
- Enter three numbers (space-separated), each from 0 to 25, representing the ring setting for each rotor. The ring setting shifts the internal wiring of the rotor. Historically, this was used to add another layer of security.

### 4. Plugboard pairs (e.g. `AB CD`)
- Enter pairs of letters (no separator between letters, space between pairs) to swap on the plugboard. For example, `AB CD` swaps A<->B and C<->D. You can leave this blank for no plugboard swaps.

### Example Session
```
$ node enigma.js
Enter message: HELLOWORLD
Rotor positions (e.g. 0 0 0): 0 0 0
Ring settings (e.g. 0 0 0): 0 0 0
Plugboard pairs (e.g. AB CD): QW ER
Output: ZISNQXQKGA
```

### Notes
- The machine always uses rotors I, II, and III (historical Enigma I order, rightmost rotor steps every keypress).
- Only uppercase A-Z are encrypted; all other characters are output unchanged.
- The same settings must be used to decrypt a message as were used to encrypt it.
