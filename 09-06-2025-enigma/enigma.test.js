const {
  mod,
  alphabet,
  ROTORS,
  REFLECTOR,
  plugboardSwap,
  Rotor,
  Enigma
} = require('./enigma');

describe('Enigma Machine Tests', () => {
  
  describe('mod function', () => {
    test('should handle positive numbers correctly', () => {
      expect(mod(5, 3)).toBe(2);
      expect(mod(10, 7)).toBe(3);
      expect(mod(26, 26)).toBe(0);
    });

    test('should handle negative numbers correctly', () => {
      expect(mod(-1, 26)).toBe(25);
      expect(mod(-5, 3)).toBe(1);
      expect(mod(-27, 26)).toBe(25);
    });

    test('should handle zero correctly', () => {
      expect(mod(0, 26)).toBe(0);
      expect(mod(0, 5)).toBe(0);
    });

    test('should handle exact multiples', () => {
      expect(mod(26, 26)).toBe(0);
      expect(mod(52, 26)).toBe(0);
      expect(mod(-26, 26)).toBe(0);
    });
  });

  describe('alphabet constant', () => {
    test('should be correct alphabet string', () => {
      expect(alphabet).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(alphabet.length).toBe(26);
    });
  });

  describe('ROTORS constant', () => {
    test('should have 3 rotors with correct properties', () => {
      expect(ROTORS).toHaveLength(3);
      expect(ROTORS[0]).toHaveProperty('wiring');
      expect(ROTORS[0]).toHaveProperty('notch');
      expect(ROTORS[0].notch).toBe('Q');
      expect(ROTORS[1].notch).toBe('E');
      expect(ROTORS[2].notch).toBe('V');
    });

    test('should have correct wiring lengths', () => {
      ROTORS.forEach(rotor => {
        expect(rotor.wiring.length).toBe(26);
      });
    });
  });

  describe('REFLECTOR constant', () => {
    test('should have correct length', () => {
      expect(REFLECTOR.length).toBe(26);
    });

    test('should be valid reflector (symmetric)', () => {
      // Check if reflector is symmetric - if A maps to B, then B should map to A
      for (let i = 0; i < 26; i++) {
        const char1 = alphabet[i];
        const mapped = REFLECTOR[i];
        const mappedIndex = alphabet.indexOf(mapped);
        const backMapped = REFLECTOR[mappedIndex];
        expect(backMapped).toBe(char1);
      }
    });
  });

  describe('plugboardSwap function', () => {
    test('should swap characters according to pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('B', pairs)).toBe('A');
      expect(plugboardSwap('C', pairs)).toBe('D');
      expect(plugboardSwap('D', pairs)).toBe('C');
    });

    test('should return unchanged character if not in pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      expect(plugboardSwap('E', pairs)).toBe('E');
      expect(plugboardSwap('Z', pairs)).toBe('Z');
    });

    test('should handle empty pairs array', () => {
      expect(plugboardSwap('A', [])).toBe('A');
      expect(plugboardSwap('Z', [])).toBe('Z');
    });

    test('should handle multiple pairs', () => {
      const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']];
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('E', pairs)).toBe('F');
      expect(plugboardSwap('G', pairs)).toBe('H');
      expect(plugboardSwap('I', pairs)).toBe('I');
    });
  });

  describe('Rotor class', () => {
    let rotor;

    beforeEach(() => {
      rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
    });

    test('should initialize with correct properties', () => {
      expect(rotor.wiring).toBe(ROTORS[0].wiring);
      expect(rotor.notch).toBe(ROTORS[0].notch);
      expect(rotor.ringSetting).toBe(0);
      expect(rotor.position).toBe(0);
    });

    test('should initialize with custom settings', () => {
      const customRotor = new Rotor(ROTORS[1].wiring, ROTORS[1].notch, 5, 10);
      expect(customRotor.wiring).toBe(ROTORS[1].wiring);
      expect(customRotor.notch).toBe(ROTORS[1].notch);
      expect(customRotor.ringSetting).toBe(5);
      expect(customRotor.position).toBe(10);
    });

    test('should step correctly', () => {
      expect(rotor.position).toBe(0);
      rotor.step();
      expect(rotor.position).toBe(1);
      
      // Test wrapping around
      rotor.position = 25;
      rotor.step();
      expect(rotor.position).toBe(0);
    });

    test('should detect notch position correctly', () => {
      // Rotor I has notch at 'Q' (position 16)
      rotor.position = 16;
      expect(rotor.atNotch()).toBe(true);
      
      rotor.position = 0;
      expect(rotor.atNotch()).toBe(false);
      
      rotor.position = 15;
      expect(rotor.atNotch()).toBe(false);
    });

    test('should perform forward substitution', () => {
      const result = rotor.forward('A');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(1);
      expect(alphabet.includes(result)).toBe(true);
    });

    test('should perform backward substitution', () => {
      const result = rotor.backward('E');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(1);
      expect(alphabet.includes(result)).toBe(true);
    });

    test('should handle different positions in forward substitution', () => {
      const rotor1 = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
      const rotor2 = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 5);
      
      const result1 = rotor1.forward('A');
      const result2 = rotor2.forward('A');
      
      // Different positions should generally produce different results
      // (though there might be edge cases where they're the same)
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });

    test('should handle ring settings in forward/backward operations', () => {
      const rotorWithRing = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 3, 0);
      const result = rotorWithRing.forward('A');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(1);
      expect(alphabet.includes(result)).toBe(true);
    });
  });

  describe('Enigma class', () => {
    let enigma;

    beforeEach(() => {
      enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
    });

    test('should initialize with correct rotors', () => {
      expect(enigma.rotors).toHaveLength(3);
      expect(enigma.rotors[0].wiring).toBe(ROTORS[0].wiring);
      expect(enigma.rotors[1].wiring).toBe(ROTORS[1].wiring);
      expect(enigma.rotors[2].wiring).toBe(ROTORS[2].wiring);
    });

    test('should initialize with custom positions and ring settings', () => {
      const customEnigma = new Enigma([2, 1, 0], [1, 2, 3], [4, 5, 6], [['A', 'B']]);
      expect(customEnigma.rotors[0].position).toBe(1);
      expect(customEnigma.rotors[1].position).toBe(2);
      expect(customEnigma.rotors[2].position).toBe(3);
      expect(customEnigma.rotors[0].ringSetting).toBe(4);
      expect(customEnigma.rotors[1].ringSetting).toBe(5);
      expect(customEnigma.rotors[2].ringSetting).toBe(6);
      expect(customEnigma.plugboardPairs).toEqual([['A', 'B']]);
    });

    test('should step rotors correctly - basic stepping', () => {
      const initialPositions = enigma.rotors.map(r => r.position);
      enigma.stepRotors();
      
      // Only rightmost rotor should step in basic case
      expect(enigma.rotors[0].position).toBe(initialPositions[0]);
      expect(enigma.rotors[1].position).toBe(initialPositions[1]);
      expect(enigma.rotors[2].position).toBe(initialPositions[2] + 1);
    });

    test('should step middle rotor when right rotor is at notch', () => {
      // Set right rotor to notch position
      enigma.rotors[2].position = alphabet.indexOf(ROTORS[2].notch); // 'V' = position 21
      const initialPositions = enigma.rotors.map(r => r.position);
      
      enigma.stepRotors();
      
      expect(enigma.rotors[0].position).toBe(initialPositions[0]); // Left shouldn't move
      expect(enigma.rotors[1].position).toBe(initialPositions[1] + 1); // Middle should step
      expect(enigma.rotors[2].position).toBe((initialPositions[2] + 1) % 26); // Right always steps
    });

    test('should step left rotor when middle rotor is at notch', () => {
      // Set middle rotor to notch position
      enigma.rotors[1].position = alphabet.indexOf(ROTORS[1].notch); // 'E' = position 4
      const initialPositions = enigma.rotors.map(r => r.position);
      
      enigma.stepRotors();
      
      expect(enigma.rotors[0].position).toBe(initialPositions[0] + 1); // Left should step
      expect(enigma.rotors[1].position).toBe(initialPositions[1] + 1); // Middle should ALSO step (double stepping)
      expect(enigma.rotors[2].position).toBe((initialPositions[2] + 1) % 26); // Right always steps
    });

    test('should encrypt single character', () => {
      const result = enigma.encryptChar('A');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(1);
      expect(alphabet.includes(result)).toBe(true);
    });

    test('should return non-alphabetic characters unchanged', () => {
      expect(enigma.encryptChar(' ')).toBe(' ');
      expect(enigma.encryptChar('1')).toBe('1');
      expect(enigma.encryptChar('!')).toBe('!');
    });

    test('should be reversible with same settings', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      const original = 'HELLO';
      const encrypted = enigma1.process(original);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(original);
    });

    test('should process text correctly', () => {
      const result = enigma.process('hello world');
      expect(result).toBe(result.toUpperCase());
      expect(result.length).toBe('hello world'.length);
    });

    test('should handle empty string', () => {
      expect(enigma.process('')).toBe('');
    });

    test('should handle mixed case input', () => {
      const result1 = enigma.process('HeLLo');
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result2 = enigma2.process('HELLO');
      expect(result1).toBe(result2);
    });

    test('should work with plugboard pairs', () => {
      const enigmaWithPlugboard = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
      const enigmaWithoutPlugboard = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      const result1 = enigmaWithPlugboard.process('A');
      const result2 = enigmaWithoutPlugboard.process('A');
      
      // Results should be different with plugboard
      expect(result1).not.toBe(result2);
    });

    test('should be reversible with plugboard pairs - demonstrates plugboard output bug', () => {
      // This test specifically demonstrates the missing plugboard swap at output
      const plugboardPairs = [['A', 'B'], ['C', 'D']];
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboardPairs);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboardPairs);
      
      const original = 'HELLO';
      const encrypted = enigma1.process(original);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(original);
    });

    test('should advance rotors during encryption', () => {
      const initialPositions = enigma.rotors.map(r => r.position);
      enigma.process('ABC');
      
      // After 3 characters, rightmost rotor should have advanced 3 times
      expect(enigma.rotors[2].position).toBe((initialPositions[2] + 3) % 26);
    });

    test('should produce consistent results for same configuration', () => {
      const enigma1 = new Enigma([0, 1, 2], [5, 10, 15], [1, 2, 3], [['A', 'B']]);
      const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [1, 2, 3], [['A', 'B']]);
      
      const result1 = enigma1.process('TEST');
      const result2 = enigma2.process('TEST');
      
      expect(result1).toBe(result2);
    });

    test('should produce different outputs for different rotor positions', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 1], [0, 0, 0], []);
      
      const result1 = enigma1.process('A');
      const result2 = enigma2.process('A');
      
      expect(result1).not.toBe(result2);
    });

    test('should handle different rotor orders', () => {
      const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const enigma2 = new Enigma([2, 1, 0], [0, 0, 0], [0, 0, 0], []);
      
      const result1 = enigma1.process('A');
      const result2 = enigma2.process('A');
      
      expect(result1).not.toBe(result2);
    });
  });

  describe('Integration tests', () => {
    test('should encrypt and decrypt longer messages', () => {
      const rotorSettings = [0, 1, 2];
      const positions = [5, 10, 15];
      const rings = [1, 2, 3];
      const plugboard = [['A', 'B'], ['C', 'D']];
      
      const enigma1 = new Enigma(rotorSettings, positions, rings, plugboard);
      const enigma2 = new Enigma(rotorSettings, positions, rings, plugboard);
      
      const original = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
      const encrypted = enigma1.process(original);
      const decrypted = enigma2.process(encrypted);
      
      // Test that the same configuration produces consistent results
      expect(typeof encrypted).toBe('string');
      expect(typeof decrypted).toBe('string');
      expect(encrypted.length).toBe(original.length);
      expect(decrypted.length).toBe(original.length);
      expect(encrypted).not.toBe(original);
      
      // Test that encryption and decryption are properly reversible
      expect(decrypted).toBe(original);
    });

    test('should maintain consistent behavior across multiple encryptions', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      // Process individual characters
      const char1 = enigma.encryptChar('A');
      const char2 = enigma.encryptChar('A');
      const char3 = enigma.encryptChar('A');
      
      // Reset enigma and process as string
      const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma2.process('AAA');
      
      expect(result).toBe(char1 + char2 + char3);
    });

    test('should handle sequential character encryption', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const results = [];
      
      // Encrypt same character multiple times
      for (let i = 0; i < 5; i++) {
        results.push(enigma.encryptChar('A'));
      }
      
      // Each result should be different due to rotor stepping
      const uniqueResults = [...new Set(results)];
      expect(uniqueResults.length).toBeGreaterThan(1);
    });

    test('should work with maximum plugboard pairs', () => {
      const maxPlugboard = [
        ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J'],
        ['K', 'L'], ['M', 'N'], ['O', 'P'], ['Q', 'R'], ['S', 'T']
      ];
      
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], maxPlugboard);
      const result = enigma.process('UVWXYZ');
      
      expect(typeof result).toBe('string');
      expect(result.length).toBe(6);
    });
  });

  describe('Edge cases', () => {
    test('should handle extreme rotor positions', () => {
      const enigma = new Enigma([0, 1, 2], [25, 25, 25], [25, 25, 25], []);
      const result = enigma.process('TEST');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(4);
    });

    test('should handle zero positions and settings', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('TEST');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(4);
    });

    test('should handle single character input', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const result = enigma.process('A');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(1);
      expect(alphabet.includes(result)).toBe(true);
    });

    test('should handle numbers and special characters', () => {
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      const input = 'HELLO123!@#WORLD';
      const result = enigma.process(input);
      
      expect(result).toMatch(/[A-Z0-9!@#]+/);
      expect(result.length).toBe(input.length);
    });

    test('should implement double stepping correctly - middle rotor steps when at notch', () => {
      // This test demonstrates the double stepping bug
      // In a real Enigma, when the middle rotor is at its notch:
      // 1. The leftmost rotor should step (currently working)
      // 2. The middle rotor should ALSO step (currently broken)
      
      const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
      
      // Set middle rotor to notch position (E = position 4 for Rotor II)
      enigma.rotors[1].position = alphabet.indexOf(ROTORS[1].notch); // 'E' = position 4
      const initialPositions = enigma.rotors.map(r => r.position);
      
      enigma.stepRotors();
      
      expect(enigma.rotors[0].position).toBe(initialPositions[0] + 1); // Left should step
      expect(enigma.rotors[1].position).toBe(initialPositions[1] + 1); // Middle should ALSO step (double stepping)
      expect(enigma.rotors[2].position).toBe((initialPositions[2] + 1) % 26); // Right always steps
    });
  });
}); 