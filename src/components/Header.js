import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router'
// import firebase from 'firebase'


class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      recipeID: this.props.recipeID, // Change back to this later after testing: this.props.recipeID
      recipeObject: {},
      // creatorObject: {}
      itemsFound: [],
      searchInput: ""
    };
  }

  logout = () => {
    this.props.logout();
    this.props.history.push('/');
  };

  getHeaderContentLogguedIn = () => {
    return (
      <div>
        <Link to="/edit" className="newRecipeBtn">
          <i className="icon add i24" />
          <span className="hideOnMobile">New recipe</span>
        </Link>
        <div className="accountLinks">
          <p className="hideOnMobile">Welcome {this.state.username}</p>
          <a className="hideOnMobile" onClick={this.logout}>Logout</a>
          <i className="icon logout i24" onClick={this.logout} />
        </div>
      </div>
    );
  };

  getHeaderContentLogguedOut = () => {
    return (
      <div>
        <Link to="/">Login</Link>
      </div>
    );
  };


  handleSubmit = e => {
    e.preventDefault();
    this.setState({ searchInput: "" })
    this.props.history.push("/search?searchTerm=" + this.state.searchInput)
  }

  render() {
    //console.log(this.props);
    // console.log(this.state.itemsFound, this.state.recipeID, this.state.username);
    return (
      <header>
        <Link to="/" refresh="true" className="logo hideOnMobile">
          Pistach.io
        </Link>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Search"
            ref={r => (this.searchInput = r)}
            value={this.state.searchInput}
            onChange={e => this.setState({ searchInput: e.target.value })}
          />

          <button
            className="searchbar"
            type="submit"
          >
            <i className="icon search i24" />
          </button>
        </form>
        {this.state.username
          ? this.getHeaderContentLogguedIn()
          : this.getHeaderContentLogguedOut()}
      </header>
    );
  }
}

export default withRouter(Header);
