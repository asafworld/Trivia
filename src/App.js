import React from 'react';
// import logo from './trivia.png';
import { Switch, Route } from 'react-router-dom';
import Config from './pages/Config';
import Login from './pages/Login/Login';
import Game from './pages/Game/Game';
import './App.css';
import Feedback from './pages/Feedback/Feedback';
import Ranking from './pages/Ranking/Ranking';

export default function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={ Login } />
        <Route path="/settings" component={ Config } />
        <Route path="/game" component={ Game } />
        <Route path="/feedback" component={ Feedback } />
        <Route path="/ranking" component={ Ranking } />
      </Switch>
    </div>
  );
}
