import { useState, useEffect } from 'react'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { quiz } from './QueAns'
import './quiz.css'

const config = {
  apiKey: "AIzaSyCYSaPFiOsyj79E8Jw2Mm3wHdRFFrxW_hQ",
  authDomain: "onlineproctoringsystem.firebaseapp.com",
  databaseURL: "https://onlineproctoringsystem-default-rtdb.firebaseio.com",
  projectId: "onlineproctoringsystem",
  storageBucket: "onlineproctoringsystem.appspot.com",
  messagingSenderId: "349900487595",
  appId: "1:349900487595:web:d32bf01bf2a28c37c2b0ee",
  measurementId: "G-3S6ENLPK2F"
};

firebase.initializeApp(config);

const Quiz = () => {
  
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)
  const [result, setResult] = useState({
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  })

  const { questions } = quiz
  const { question, choices, correctAnswer } = questions[activeQuestion]

  useEffect(() => {
    firebase.auth().signInAnonymously()
      .then(() => console.log('Signed in anonymously to Firebase'))
      .catch(error => console.error('Error signing in anonymously:', error));
  }, []);

  const onClickNext = () => {
    setSelectedAnswerIndex(null)
    setResult((prev) =>
      selectedAnswer
        ? {
            ...prev,
            score: prev.score + 5,
            correctAnswers: prev.correctAnswers + 1,
          }
        : { ...prev, wrongAnswers: prev.wrongAnswers + 1 }
    )

    if (activeQuestion !== questions.length - 1) {
      setActiveQuestion((prev) => prev + 1)
    } else {
      setShowResult(true)

      // Store the quiz results in Firebase
      const db = firebase.database();
      const userResultsRef = db.ref('quizResults').push();

      userResultsRef.set({
        score: result.score,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
       
      }).then(() => {
        console.log('Quiz results stored in Firebase');
      }).catch(error => {
        console.error('Error storing quiz results in Firebase:', error);
      });
    }
  }

  const onAnswerSelected = (answer, index) => {
    setSelectedAnswerIndex(index)
    if (answer === correctAnswer) {
      setSelectedAnswer(true)
    } else {
      setSelectedAnswer(false)
    }
  }

  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`)

  return (
    <div className="quiz-container">
      {!showResult ? (
        <div>
          <div>
            <span className="active-question-no">
              {addLeadingZero(activeQuestion + 1)}
            </span>
            <span className="total-question">
              /{addLeadingZero(questions.length)}
            </span>
          </div>
          <h2>{question}</h2>
          <ul>
            {choices.map((answer, index) => (
              <li
                onClick={() => onAnswerSelected(answer, index)}
                key={answer}
                className={
                  selectedAnswerIndex === index ? 'selected-answer' : null
                }>
                {answer}
              </li>
            ))}
          </ul>
          <div className="flex-right">
            <button
              onClick={onClickNext}
              disabled={selectedAnswerIndex === null}>
              {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      ) : (
        <div className="result">
          
          <h3>Result</h3>
          <p>
            Total Question: <span>{questions.length}</span>
          </p>
          <p>
            Total Score:<span> {result.score}</span>
          </p>
          <p>
            Correct Answers:<span> {result.correctAnswers}</span>
          </p>
          <p>
            Wrong Answers:<span> {result.wrongAnswers}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default Quiz;
