export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const weightedRandomChoice = <T>(items: T[], weights: number[]): T | undefined => {
  if (items.length !== weights.length || items.length === 0) {
    throw new Error('Items and weights must have the same length');
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  let randomVal = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (randomVal < weights[i]) {
      return items[i];
    }
    randomVal -= weights[i];
  }

  return items[items.length - 1];
};
