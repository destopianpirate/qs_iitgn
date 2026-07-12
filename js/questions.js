// js/questions.js
// This array contains trivia questions for the Daily Challenge.
// To support a full year, this array can be expanded to 365 items.

const dailyQuestions = [
  {
    question: "What was the first feature-length animated movie ever released?",
    options: ["Pinocchio", "Snow White and the Seven Dwarfs", "Fantasia", "Gulliver's Travels"],
    correctIndex: 1
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1
  },
  {
    question: "Who wrote 'Hamlet'?",
    options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
    correctIndex: 1
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Kyoto"],
    correctIndex: 2
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctIndex: 1
  },
  {
    question: "In what year did the Titanic sink?",
    options: ["1912", "1905", "1923", "1898"],
    correctIndex: 0
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctIndex: 3
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    correctIndex: 2
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctIndex: 2
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2
  }
];

// No placeholders needed! We will just loop through the available questions.

window.getQuestionOfTheDay = function getQuestionOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Wrap around safely
  const len = dailyQuestions.length;
  const index = ((dayOfYear - 1) % len + len) % len;
  return dailyQuestions[index] || dailyQuestions[0];
}
