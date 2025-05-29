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
  lastSelected: Date
): number => {
  const now = new Date();
  const age = (now.getTime() - lastSelected.getTime()) / (1000 * 60); // age in minutes
  const decay = age * decayRate;
  return priority / (1 + decay);
}; 