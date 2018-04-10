import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RecipePage from './components/RecipePage';
import CreateRecipePage from './components/CreateRecipePage';
import SearchPage from './components/SearchPage';

import Header from './components/Header';
import firebase from './scripts/firebase';
import './App.css';

// var user = firebase.auth().currentUser;

class App extends Component {
  constructor() {
    super();
    this.state = {
      userID: undefined,
      username: undefined,
      persist: false
    }
  }

  componentDidMount() {
    const state = JSON.parse(localStorage.getItem('login'));
    this.setState({ ...state, persist: true });
  }

  setLoginState = (state) => {
    // this.getUserCookbooks();
    this.setState(state, () => {
      localStorage.setItem('login', JSON.stringify(this.state));
    });
  }

  logout = (state) => {
    // this.getUserCookbooks();
    firebase.auth().signOut();
    // console.log(firebase.auth().currentUser);
    localStorage.removeItem("login");
    this.setState({ username: "" });
  }

  setUsernameAndID = (username, userID) => {
    this.setLoginState({userID, username})
  }

  render() {
    if(!this.state.persist) return <div/>
    if (!this.state.username) {
      return (
        <div className="App">
          {/* <Route path="/recipe" 
            // This route renders the header for paths outside of login
            render={(routeProps) => (
              <Header 
                username={this.state.username}
              />
            )}
          /> */}
          <Switch>
            <Route
              path="/recipe/:recipeID"
              render={(routeProps) => (
                <RecipePage 
                  recipeID={routeProps.match.params.recipeID}
                />
              )}
            />
            <Route
              exact path="/"
              render={(routeProps) => (
                <LoginPage
                  setUsernameAndID={(username, userID) => this.setUsernameAndID(username, userID)}
                />
              )}
            />
          </Switch>
        </div>
      );
    }
    return (
      <div className="App">
        <Header 
          userID={this.state.userID}
          username={this.state.username}
          logout={this.logout}
        />
        <Switch>
          <Route
            exact path="/"
            render={(routeProps) => (
              <HomePage
                userID={this.state.userID}
                username={this.state.username}
                history={routeProps.history}
              />
            )}
          />
          <Route
            path="/recipe/:recipeID"
            render={(routeProps) => (
              <RecipePage
              recipeID={routeProps.match.params.recipeID}
              userID={this.state.userID}
              username={this.state.username}
              location={routeProps.location}
              history={routeProps.history}
              />
            )}
          />
          <Route
            exact path="/edit"
            render={(routeProps) => (
              <CreateRecipePage
              userID={this.state.userID}
              username={this.state.username}
              location={routeProps.location}
              history={routeProps.history}
              />
            )}
          />
          <Route
            path="/search"
            render={(routeProps) => (
              <SearchPage 
              location={routeProps.location}
              username={this.state.username}
              />
            )}
          />
          <Route
            render={() =>
              <h1>Page not found</h1>}
          />
		    </Switch>
      </div>
    );
  }
}

export default App;