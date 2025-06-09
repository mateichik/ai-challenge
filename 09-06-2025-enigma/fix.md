# Bug Description

## Issue
The Enigma machine encryption is not properly reversible - encrypting a message and then decrypting it with the same settings does not return the original message.

## Root Cause
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

## Expected Behavior
In a real Enigma machine, the plugboard transformation should be applied both:
1. At the input (before signal goes through rotors) ✅ Currently implemented
2. At the output (after signal comes back through rotors and reflector) ❌ **MISSING**

## Fix Required
Add `c = plugboardSwap(c, this.plugboardPairs);` before the `return c;` statement in the `encryptChar` method.

This will ensure the Enigma machine is properly symmetric and encryption/decryption are reversible. 