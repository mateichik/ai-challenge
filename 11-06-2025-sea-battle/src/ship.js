// Ship Management Class
class Ship {
  #locations;
  #hits;
  #length;

  constructor(locations = []) {
    if (!Array.isArray(locations) || locations.length === 0) {
      throw new Error('Ship locations must be a non-empty array');
    }
    
    this.#locations = [...locations]; // Create copy to prevent external modification
    this.#length = locations.length;
    this.#hits = new Array(this.#length).fill('');
  }

  // Hit a specific location on the ship
  hit(location) {
    const index = this.#locations.indexOf(location);
    if (index === -1) {
      return false; // Location not part of this ship
    }
    
    if (this.#hits[index] === 'hit') {
      return false; // Already hit
    }
    
    this.#hits[index] = 'hit';
    return true; // Successful hit
  }

  // Check if the ship is completely sunk
  isSunk() {
    return this.#hits.every(hit => hit === 'hit');
  }

  // Get ship locations (copy to prevent external modification)
  getLocations() {
    return [...this.#locations];
  }

  // Get hit status for a specific location
  getHitStatus(location) {
    const index = this.#locations.indexOf(location);
    return index !== -1 ? this.#hits[index] : null;
  }

  // Check if a location belongs to this ship
  hasLocation(location) {
    return this.#locations.includes(location);
  }

  // Get the ship length
  getLength() {
    return this.#length;
  }

  // Get number of hits received
  getHitCount() {
    return this.#hits.filter(hit => hit === 'hit').length;
  }

  // Get remaining health (unhit segments)
  getRemainingHealth() {
    return this.#length - this.getHitCount();
  }

  // For backward compatibility - convert to old format (temporary for transition)
  _toLegacyFormat() {
    return {
      locations: [...this.#locations],
      hits: [...this.#hits]
    };
  }

  // Create Ship from legacy format
  static fromLegacyFormat(legacyShip) {
    const ship = new Ship(legacyShip.locations);
    // Restore hit status
    for (let i = 0; i < legacyShip.hits.length; i++) {
      if (legacyShip.hits[i] === 'hit') {
        ship.#hits[i] = 'hit';
      }
    }
    return ship;
  }
}

export { Ship }; 