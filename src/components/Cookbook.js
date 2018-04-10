import React, { Component } from "react";
import { Link } from "react-router-dom";
import RecipeCard from "./RecipeCard";
// import { firebase } from '../scripts/firebase';
import { cookbooksRef, usersRef } from "../scripts/db";
import LoadingAnimation from "./LoadingAnimation";
// import RecipePage from "./RecipePage";

class Cookbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cookbookID: this.props.cookbookID, // Once completed, set back to: this.props.cookbookID
      cookbookObject: {},
      creatorObject: {}, // Required Anywhere ? Remove Later If Not
      cookbookTitle: null,
      recipeIDs: [],
      loaded: false,
      // recipeToPrint: []
    };
  }

  componentWillMount = async () => {
    let cookbook = {};
    let cookbookRecipeIDs;
    let cookbookTtl;

    await cookbooksRef
      .child(this.state.cookbookID)
      .once("value")
      .then(snapshot => {
        cookbook = snapshot.val();
          console.log(cookbook)
        cookbookTtl = cookbook.title.value;
        cookbookRecipeIDs = cookbook.recipeIDs;
        return cookbook.ownerUserID;
      })
      .then(ownerUserID => {
        return usersRef.child(ownerUserID).once("value");
      })
      .then(creatorObj => {
        this.setState({
          cookbookObject: cookbook,
          cookbookTitle: cookbookTtl,
          creatorObject: creatorObj.val(),
          recipeIDs: cookbookRecipeIDs,
          loaded: true, 
          // recipeToPrint: ""
        });
      })
      .catch(err => {
        console.log("COOKBOOK.JS > COMPONENTWILLMOUNT ERROR =", err);
      });
  };

  getClassName = () => {
    return `flexContain cookBookContainer ${
      this.props.isHidden ? "isHidden" : ""
    }`;
  };

  // removeRecipeID = (recipeID) => {
  //   this.setState({ recipeIDs : this.state.recipeIDs.filter(item => 
  //     item !== recipeID
  //   ) })
  // }

  renderAllRecipe = () => {
    if (this.state.recipeIDs === undefined) return null;
    return this.state.recipeIDs.map((recipeID, idx) => (
      <RecipeCard
        key={idx}
        recipeID={recipeID}
        username={this.props.username}
        userID={this.props.userID}
      />
    ));
  };

  // printCookbook = async () => {
  //   let cookbook = {};
  //   await cookbooksRef
  //     .child(this.state.cookbookID)
  //     .once("value")
  //     .then(snapshot => {
  //       cookbook = snapshot.val();
  //       let recipesIDs = cookbook.recipeIDs;
        
  //       console.log(recipesIDs);
  //       if(this.state.recipeToPrint === "") null
  //       recipesIDs.map((recipeID, idx) => (
  //         <RecipePage
  //           key={idx}
  //           recipeID={recipesIDs}
  //           username={this.props.username}
  //           userID={this.props.userID}
  //         />
  //       ));
  //       this.setState({ recipeToPrint: recipesIDs })
  //   });
  // };

  render() {
    // console.log(this.props.history);
    console.log(this.state.recipeToPrint);
    return (!this.state.loaded ? (
      <LoadingAnimation />
    ) : 
    // this.state.recipeToPrint !== "" ?
    // this.printCookbook() :  
    (
      <div className={this.getClassName()}>
        <header>
          <h1>{this.state.cookbookTitle}</h1>
          {/* <button onClick={this.printCookbook}>Print cookbook</button> */}
          {this.state.recipeIDs === undefined ||
          this.state.recipeIDs.length <= 0 ? (
            <h3>
              You have no recipe in this cookbook yet
              <Link to="/edit" className="addRecipe">
                <i className="icon addBlack i18" />Add a recipe
              </Link>
            </h3>
          ) : null}
        </header>
        <div className="cardContain">{this.renderAllRecipe()}</div>
      </div>
    ));
  }
}

export default Cookbook;
