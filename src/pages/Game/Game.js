import React from 'react';
import { connect } from 'react-redux';
import propTypes from 'prop-types';
import md5 from 'crypto-js/md5';
import Header from '../../components/Header';
import './Game.css';
import scoreUpdate from '../../actions/scoreUpdate';
import saveRanking from '../../functions/localStorage/rankingStorage';
import tF from '../../functions/formatation/textFormat';

const correctId = 'correct-answer';
class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      questions: {},
      index: 0,
      category: '',
      answers: [],
      question: '',
      colorBorder: false,
      timer: 30,
      difficulty: '',
      correct: '',
      next: false,
      ranking: [],
    };
  }

  componentDidMount = async () => {
    await this.verifyToken();
    this.getRanking();

    const second = 1000;
    this.timerID = setInterval(
      () => this.tick(), second,
    );
  };

  getRanking = () => {
    const savedRanking = localStorage.getItem('ranking');
    if (savedRanking !== null) this.setState({ ranking: JSON.parse(savedRanking) });
  }

  tick = () => {
    const { timer } = this.state;
    if (timer > 0) {
      this.setState((prevState) => ({
        timer: prevState.timer - 1,
      }));
    } else this.setState({ colorBorder: true, next: true });
  }

  verifyToken = async () => {
    const { history } = this.props;
    const { index } = this.state;
    const number = { half: 0.5, three: 3, five: 5 };
    const savedToken = localStorage.getItem('token');
    const url = `https://opentdb.com/api.php?amount=${number.five}&token=${savedToken}`;
    const gameQuestions = await fetch(url);
    const questionsReturn = await gameQuestions.json();

    if (questionsReturn.response_code === number.three) {
      localStorage.removeItem('token');
      history.push('/');
    } else {
      this.setState({
        questions: questionsReturn,
        category: questionsReturn.results[index].category,
        difficulty: questionsReturn.results[index].difficulty,
        correct: questionsReturn.results[index].correct_answer,
        answers: [
          { answer: questionsReturn.results[index].correct_answer,
            id: correctId },
          ...questionsReturn.results[index].incorrect_answers.map(
            (iAnswer, i) => ({
              answer: iAnswer,
              id: `wrong-answer-${i}` }),
          ),
        ].sort(() => number.half - Math.random()),
        question: questionsReturn.results[index].question,
      });
    }
  };

  border = (answer, correctA) => {
    if (answer === correctA) return 'answer green';
    return 'answer red';
  };

  selectAnswer = (event) => {
    this.setState({ colorBorder: true, next: true });
    this.ponctuationFunction(event);
  }

  ponctuationFunction = (event) => {
    const number = { one: 1, two: 2, three: 3, ten: 10 };
    const { correct, difficulty, timer } = this.state;
    const { dispatch } = this.props;
    if (event.target.name === correct) {
      if (difficulty === 'hard') {
        dispatch(scoreUpdate(number.ten + (timer * number.three)));
      } else if (difficulty === 'medium') {
        dispatch(scoreUpdate(number.ten + (timer * number.two)));
      } else {
        dispatch(scoreUpdate(number.ten + (timer * number.one)));
      }
    }
  }

  changeIndex = () => {
    const four = 4;
    const { index, ranking } = this.state;
    const { history, name, scorePoints, email } = this.props;
    const emailCrypto = md5(email).toString();
    if (index === four) {
      if (ranking.length === 0) {
        const newRanking = [{ name, score: scorePoints, picture: `https://www.gravatar.com/avatar/${emailCrypto}` }];
        saveRanking(newRanking);
      } else {
        const newRanking = [...ranking, { name, score: scorePoints, picture: `https://www.gravatar.com/avatar/${emailCrypto}` }];
        saveRanking(newRanking);
      }
      history.push('/feedback');
    } else {
      this.setState((prevState) => ({
        index: prevState.index + 1,
        colorBorder: false,
        timer: 30,
        next: false }));
      this.changeState();
    }
  }

  changeState = () => {
    const { questions } = this.state;
    const half = 0.5;
    this.setState((prevState) => ({
      category: questions.results[prevState.index].category,
      difficulty: questions.results[prevState.index].difficulty,
      correct: questions.results[prevState.index].correct_answer,
      answers: [
        { answer: questions.results[prevState.index].correct_answer,
          id: correctId },
        ...questions.results[prevState.index].incorrect_answers.map(
          (iAnswer, i) => ({
            answer: iAnswer,
            id: `wrong-answer-${i}`,
          }),
        ),
      ].sort(() => half - Math.random()),
      question: questions.results[prevState.index].question,
    }));
  }

  changeColor = (timer) => {
    const n = { five: 5, ten: 10 };
    if (timer <= n.five) return 'timer timerRed';
    if (timer <= n.ten) return 'timer timerYellow';
    return 'timer timerGreen';
  }

  render() {
    const { answers, category, question,
      colorBorder, timer, next, difficulty } = this.state;

    const correctAnswerElement = answers.find(
      (answer) => answer.id === 'correct-answer',
    );

    const correctAnswer = () => {
      if (correctAnswerElement !== undefined) {
        return correctAnswerElement.answer;
      }
    };

    return (
      <article className="game-article">
        <Header />
        <section className="game-section">
          <span data-testid="timer" className={ this.changeColor(timer) }>
            {timer}
          </span>
          <section className={ `quiz q-${difficulty}` }>
            {question === '' && <p className="loading" />}
            <span
              className={ `c-${difficulty}` }
              data-testid="question-category"
            >
              {category}
            </span>
            <span
              className={ difficulty }
              data-testid="question-difficulty"
            >
              {difficulty}
            </span>
            <h3 data-testid="question-text">{tF(question)}</h3>
            <section data-testid="answer-options" className="answer-options">
              {answers.map((a, i) => (
                <button
                  data-testid={ a.id }
                  name={ a.answer }
                  key={ i }
                  type="button"
                  className={
                    colorBorder ? this.border(a.answer, correctAnswer()) : 'answer'
                  }
                  onClick={ (event) => this.selectAnswer(event) }
                  disabled={ colorBorder }
                >
                  {tF(a.answer)}
                </button>
              ))}
            </section>
            {next && (
              <button
                type="button"
                data-testid="btn-next"
                onClick={ () => this.changeIndex() }
                className={ `btn-next n-${difficulty}` }
              >
                Next
              </button>
            )}
          </section>
        </section>
      </article>
    );
  }
}

const mapStateToProps = (state) => ({
  name: state.player.name,
  scorePoints: state.player.score,
  email: state.player.gravatarEmail,
});

Game.propTypes = {
  history: propTypes.shape({
    push: propTypes.func,
  }).isRequired,
  dispatch: propTypes.func.isRequired,
  name: propTypes.string.isRequired,
  scorePoints: propTypes.number.isRequired,
  email: propTypes.string.isRequired,
};

export default connect(mapStateToProps)(Game);
