import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { NotificationContainer, NotificationManager } from 'react-notifications';


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alphabets: [''],
      selectedAlphabet: '',
      wordList: [],
      totalPoints: 0,
      color: 'white',
    }
  }

  componentDidMount() {
    this.getRandomAlphabets(4);
  }

  getRandomAlphabets(boardSize) {

    fetch('http://localhost:8080/boggle-service/alphabetWordList/' + boardSize)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          alphabets: data,
          selectedAlphabet: '',
          wordList: [],
          totalPoints: 0
        })
      })
      .catch(console.log)
  }

  getNeighbors(alphabet) {

    var object = this.state.alphabets.filter(item => {
      return item.alphabet === alphabet
    })
    return object[0].neighbors;
  }

  validateWord(word) {
    var url = 'http://localhost:8080/boggle-service/validateWord/' + word.toLowerCase();
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        if (data) {
          var wordList = this.state.wordList;
          wordList.push(word)
          var totalPoints = this.state.totalPoints
          totalPoints += word.length
          this.setState({
            alphabets: this.state.alphabets,
            selectedAlphabet: this.state.selectedAlphabet,
            wordList: wordList,
            totalPoints: totalPoints
          })
        }
        else {
          NotificationManager.info('Invalid word', '', 1000);
        }
      })
      .catch(console.log)
  }

  render() {
    if (this.state.alphabets.length > 1) {
      var alphabets = this.state.alphabets.map(item => item.alphabet);
    }
    else {
      var alphabets = ['S', 'R', 'V', 'R', 'E', 'R', 'R', ' ', '4', '0', '4', ' ']
    }
    var words = this.state.wordList
    return (
      <div className="container game" style={{marginLeft:'33%'}}>
        <div className="" style={{ height: 'auto', width: '20%', backgroundColor: 'skyblue', padding:35, textAlign:'center' }}>

            <text style={{color:'white'}}><h1 style={{alignSelf:'right'}}>BOGGLE</h1></text>


          <div className="row" style={{ paddingBottom: '20PX' }}>
            {
              alphabets.map((val, index) => {
                return (
                  <div style={{ padding: '0', width: '25%' }}>
                    <button className="whiteButton" disabled={this.props.isGameOver} style={{ width: '100%', border: '3px solid skyblue' }} onClick={() => this.myfunction(val)}>
                      <p style={{ fontSize: '20', fontWeight: 'bold',marginBottom:'0.8rem',marginTop:'0.8rem' }}>
                        {val}
                      </p>
                    </button>
                  </div>
                );
              })
            }

          </div>
          <div className="row">
            <input disabled={this.props.isGameOver} style={{ width: '60%', size: 40, borderRadius:'20px' }} value={this.state.selectedAlphabet}></input>
            <button className="orangeButton" disabled={this.props.isGameOver} style={{ width: '40%' }} onClick={() => this.submitWord()}>
              Send</button>

          </div>
          <div className="row" style={{ border: '3px solid skyblue', color: 'red', fontWeight:'bold' }}>
            <NotificationContainer />
          </div>

        </div>
      <div className="" style={{ height: 'auto', width: '20%', backgroundColor: 'skyblue', padding:'150px 35px 35px 35px', textAlign:'center' }}>
      <div className="row" style={{ border: '3px solid skyblue',  color: 'white', fontWeight:'bold', alignItems:'center' }}>
            Total Points:&ensp;<h1>{this.state.totalPoints}</h1>
          </div>
          <div className="row" style={{ border: '3px solid skyblue', color: 'white', fontWeight:'bold' }}>
            Selected words: 
          </div>

          <div className="row" style={{ border: '3px solid skyblue', color: 'white', fontWeight:'bold', textAlign:'initial' }}>
            {
              words.map((val, index) => {
                return (
                  <div style={{ width: '100%' }}>
                    <h1>
                      {val}
                    </h1>
                  </div>
                );
              })
            }

          </div>
      </div>
      </div>
    );
  }

  myfunction(val) {
    let word = this.state.selectedAlphabet;
    this.setState({
      alphabets: this.state.alphabets,
      selectedAlphabet: word + val,
      wordList: this.state.wordList,
      totalPoints: this.state.totalPoints,
    });
  }

  submitWord() {
    var word = this.state.selectedAlphabet;
    var isValid = true;
    for (let i = 1; i < word.length; i++) {
      if (!(this.getNeighbors(word[i - 1]).includes(word[i]))) {
        isValid = false;
      }
      if (word.substring(0, i).includes(word[i])) {
        isValid = false;
      }
    }
    if (isValid) {
      this.validateWord(this.state.selectedAlphabet);
    }
    else {
      NotificationManager.info('Invalid word', '', 1000);
    }
    this.setState({
      alphabets: this.state.alphabets,
      selectedAlphabet: '',
      wordList: this.state.wordList,
      totalPoints: this.state.totalPoints
    })
  }
}

export default class Timer extends React.Component {
  state = {
    minutes: 1,
    seconds: 0,
  }

  componentDidMount() {
    this.myInterval = setInterval(() => {
      const { seconds, minutes } = this.state

      if (seconds > 0) {
        this.setState(({ seconds }) => ({
          seconds: seconds - 1
        }))
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(this.myInterval)
        } else {
          this.setState(({ minutes }) => ({
            minutes: minutes - 1,
            seconds: 59
          }))
        }
      }
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.myInterval)
  }

  render() {
    const { minutes, seconds } = this.state
    if (!(minutes === 0 && seconds === 0)) {
      return (
        <div className="display">
          <Game isGameOver={false} />
          <div>
            {
              <h1 style={{color: 'skyblue'}}>Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</h1>
            }
          </div>
        </div>

      )
    }
    else {
      return (
        <div className="display">
          <Game isGameOver={true} />
          <div>
            {
              <h1 style={{color: 'skyblue'}}>Game over</h1>
            }
          </div>
        </div>
      )
    }

  }
}



// ========================================

ReactDOM.render(
  <Timer />,
  document.getElementById('root')
);
