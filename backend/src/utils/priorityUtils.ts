/**
 * Priority System Documentation
 * 
 * The priority system uses a combination of base priority, time-based decay, and stochastic selection
 * to create a dynamic and balanced goal selection process.
 * 
 * 1. Base Priority
 *    - Each goal has a base priority value (0-1)
 *    - Higher values indicate more important goals
 *    - Can be manually adjusted or automatically modified through accept/reject actions
 * 
 * 2. Time-Based Decay
 *    - Goals decay over time to prevent high-priority goals from dominating
 *    - Decay is calculated in minutes: age = (current_time - last_selected_time) / (1000 * 60)
 *    - Decay rate is configurable per goal (default: 0.001)
 *    - Formula: effective_priority = base_priority / (1 + (age * decay_rate))
 *    - This creates a hyperbolic decay curve, ensuring:
 *      * Recent goals maintain most of their priority
 *      * Older goals gradually decrease in priority
 *      * No goal ever reaches zero priority
 * 
 * 3. Stochastic Selection
 *    - Goals are selected using inverse priority weighting
 *    - Lower priority goals have a higher chance of selection
 *    - Formula: selection_chance = 1 / effective_priority
 *    - This ensures:
 *      * High priority goals are selected more frequently
 *      * Low priority goals still have a chance to be selected
 *      * No goal is ever completely ignored
 * 
 * 4. Accept/Reject Mechanics
 *    - Accepting a goal: priority *= 0.9 (10% decrease)
 *    - Rejecting a goal: priority *= 1.1 (10% increase)
 *    - These changes affect the base priority, which then influences future selections
 * 
 * This system creates a self-balancing mechanism where:
 * - Frequently selected goals gradually decrease in priority
 * - Neglected goals increase in priority over time
 * - The combination of decay and stochastic selection ensures all goals get attention
 * - The system naturally adapts to user preferences through accept/reject actions
 */

/**
 * Calculate the effective priority of a goal based on its base priority, decay rate, and time since last selected
 * @param priority Base priority of the goal
 * @param decayRate Rate at which priority decays over time
 * @param lastSelected Date when the goal was last selected
 * @returns The effective priority value
 */
export const calculateEffectivePriority = (
  priority: number,
  decayRate: number,
  lastSelected: Date | string
): number => {
  const now = new Date();
  const lastSelectedDate = typeof lastSelected === 'string' ? new Date(lastSelected) : lastSelected;
  const age = (now.getTime() - lastSelectedDate.getTime()) / (1000 * 60); // age in minutes
  const decay = age * decayRate;
  return priority / (1 + decay);
}; 