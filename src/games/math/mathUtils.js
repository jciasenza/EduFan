export const MATH_ROUNDS = 10;

export function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function makeOptions(correctAnswer, minimum, maximum) {
  const options = new Set([correctAnswer]);

  while (options.size < 4) {
    const option = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    options.add(option);
  }

  return shuffle(Array.from(options));
}
