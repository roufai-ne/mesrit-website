/**
 * Circuit Breaker — Protection contre les pannes en cascade
 *
 * États :
 *  CLOSED   → Fonctionnement normal, les appels passent
 *  OPEN     → Service considéré HS, les appels sont bloqués immédiatement
 *  HALF_OPEN → Période de test : un seul appel passe pour tester la reprise
 *
 * Transition :
 *  CLOSED  --[>= failureThreshold pannes]--> OPEN
 *  OPEN    --[timeout écoulé]-------------> HALF_OPEN
 *  HALF_OPEN --[succès]------------------> CLOSED
 *  HALF_OPEN --[échec]-------------------> OPEN (reset du timer)
 */

const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker {
  /**
   * @param {string} name             Identifiant du service (pour les logs)
   * @param {object} opts
   * @param {number} opts.failureThreshold  Nombre d'échecs avant ouverture (défaut 5)
   * @param {number} opts.timeout           ms avant de passer en HALF_OPEN (défaut 30 000)
   * @param {number} opts.successThreshold  Succès consécutifs pour refermer (défaut 2)
   */
  constructor(name, opts = {}) {
    this.name = name;
    this.state = STATES.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;

    this.failureThreshold  = opts.failureThreshold  ?? 5;
    this.timeout           = opts.timeout           ?? 30_000;
    this.successThreshold  = opts.successThreshold  ?? 2;
  }

  /**
   * Exécute fn() en passant par le circuit breaker.
   * Lance une Error si le circuit est OPEN.
   *
   * @param {Function} fn  Fonction async à appeler
   * @returns {Promise<*>} Résultat de fn()
   */
  async execute(fn) {
    if (this.state === STATES.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this._transition(STATES.HALF_OPEN);
      } else {
        throw new Error(
          `[CircuitBreaker:${this.name}] OPEN — service indisponible, réessayez dans ${
            Math.ceil((this.timeout - (Date.now() - this.lastFailureTime)) / 1000)
          }s`
        );
      }
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    if (this.state === STATES.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.failures = 0;
        this.successes = 0;
        this._transition(STATES.CLOSED);
      }
    } else {
      // Réinitialiser les échecs en cas de succès en mode CLOSED
      this.failures = 0;
    }
  }

  _onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    if (this.state === STATES.HALF_OPEN || this.failures >= this.failureThreshold) {
      this._transition(STATES.OPEN);
    }
  }

  _transition(newState) {
    if (this.state !== newState) {
      console.warn(`[CircuitBreaker:${this.name}] ${this.state} → ${newState}`);
      this.state = newState;
    }
  }

  getStatus() {
    return {
      name:     this.name,
      state:    this.state,
      failures: this.failures,
      ...(this.lastFailureTime && {
        lastFailure: new Date(this.lastFailureTime).toISOString(),
      }),
    };
  }
}

/**
 * Instances partagées — un circuit breaker par service externe.
 * Importez `breakers` puis appelez breakers.strapi.execute(() => fetch(...))
 */
export const breakers = {
  strapi:    new CircuitBreaker('strapi',    { failureThreshold: 3, timeout: 30_000 }),
  openai:    new CircuitBreaker('openai',    { failureThreshold: 5, timeout: 60_000 }),
  anthropic: new CircuitBreaker('anthropic', { failureThreshold: 5, timeout: 60_000 }),
  sendgrid:  new CircuitBreaker('sendgrid',  { failureThreshold: 3, timeout: 30_000 }),
  turnstile: new CircuitBreaker('turnstile', { failureThreshold: 5, timeout: 30_000 }),
};

export default CircuitBreaker;
