export function calculateScore(answers) {
  return answers.reduce((total, answer) => total + answer.score, 0);
}