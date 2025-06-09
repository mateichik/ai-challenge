# Bug Description

## Issue 1: Missing Plugboard Swap at Output
The Enigma machine encryption is not properly reversible - encrypting a message and then decrypting it with the same settings does not return the original message.

### Root Cause
In the `encryptChar` method, the plugboard swap is only applied at the input but missing at the output. 

**Current buggy code:**
```javascript
encryptChar(c) {
  if (!alphabet.includes(c)) return c;
  this.stepRotors();
  c = plugboardSwap(c, this.plugboardPairs);  // Applied at input
  for (let i = this.rotors.length - 1; i >= 0; i--) {
    c = this.rotors[i].forward(c);
  }

  c = REFLECTOR[alphabet.indexOf(c)];

  for (let i = 0; i < this.rotors.length; i++) {
    c = this.rotors[i].backward(c);
  }

  return c;  // Missing plugboard swap here!
}
```

### Expected Behavior
In a real Enigma machine, the plugboard transformation should be applied both:
1. At the input (before signal goes through rotors) ✅ Currently implemented
2. At the output (after signal comes back through rotors and reflector) ❌ **MISSING**

### Fix Required
Add `c = plugboardSwap(c, this.plugboardPairs);` before the `return c;` statement in the `encryptChar` method.

This will ensure the Enigma machine is properly symmetric and encryption/decryption are reversible.

## Issue 2: Incorrect Double Stepping Mechanism
The rotor stepping mechanism does not properly implement the historical Enigma's "double stepping" behavior.

### Root Cause
In the `stepRotors` method, when the middle rotor is at its notch position, it causes the leftmost rotor to step but fails to step itself.

**Current buggy code:**
```javascript
stepRotors() {
  if (this.rotors[2].atNotch()) this.rotors[1].step();
  if (this.rotors[1].atNotch()) this.rotors[0].step();  // Missing: middle rotor should also step here
  this.rotors[2].step();
}
```

### Expected Behavior
In a real Enigma machine, the double stepping mechanism should work as follows:
1. The rightmost rotor always steps
2. If the rightmost rotor is at its notch, the middle rotor steps
3. If the middle rotor is at its notch, **both** the middle rotor and the leftmost rotor step

### Fix Required
Modify the `stepRotors` method to implement double stepping correctly:
```javascript
stepRotors() {
  if (this.rotors[2].atNotch()) this.rotors[1].step();
  if (this.rotors[1].atNotch()) {
    this.rotors[0].step();
    this.rotors[1].step();  // Middle rotor steps when at its notch (double stepping)
  }
  this.rotors[2].step();
}
```

This ensures the middle rotor advances when it's at its notch position, maintaining historical accuracy of the Enigma machine's stepping mechanism. 