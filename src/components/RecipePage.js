import React, { Component } from "react";
// import firebase from "../scripts/firebase";
//import { Route } from "react-router"; "TO REMOVE WARNING : 'Route' is defined but never used"
import { withRouter } from "react-router-dom";
import { recipesRef } from "../scripts/db";
// import CreateRecipePage from "./CreateRecipePage"; "TO REMOVE WARNING : 'CreateRecipePage' is defined but never used"
import backgroundImgPattern from "../img/bg-green.jpg";
import LoadingAnimation from './LoadingAnimation';
import ShareUrl from "share-url";

class RecipePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipeID: props.recipeID,
      recipeObject: {},
      creatorObject: {},
      loaded: false,
      img: "",
      defaultImg: backgroundImgPattern,
      notes: "",
      anecdotes: ""
    };
  }

  // getRecipePath = () => {
  //   //TODO this function will return the path of the recipe
  //   //Will therefore require username from state
  //   if (this.state.loaded) {
  //     try {
  //       return `/recipe/${this.state.recipeID}`;
  //     } catch (err) {
  //       return "/recipe";
  //     }
  //   }
  //   return "/recipe";
  // };

  getRecipeTitle = () => {
    return this.state.recipeObject.recipe;
  };

  getRecipeImage = () => {
    return this.state.recipeObject.img;
  };

  getRecipeCreatorFullName = () => {
    return this.state.creatorObject.username;
  };

  getRecipeIndredients = () => {
    var ingredientsMap;
    if (this.state.recipeObject.ingredients) {
      ingredientsMap = this.state.recipeObject.ingredients.map(
        (content, index) => (
          <li key={index}>
            {content.qty + " " + content.unit + " " + content.ingr}
          </li>
        )
      );
    } else {
      ingredientsMap = <div />;
    }
    return ingredientsMap;
  };

  getPrepSteps = () => {
    var prepMap;
    if (this.state.recipeObject.prep) {
      prepMap = this.state.recipeObject.prep.map((content, index) => (
        <li key={index}>{content.step}</li>
      ));
    } else {
      prepMap = <div />;
    }
    return prepMap;
  };

  getNotes = () => {
    var notesMap;
    if (this.state.recipeObject.ownerNotes) {
      notesMap = this.state.recipeObject.ownerNotes.map((content, index) => (
        <li key={index}>{content.note}</li>
      ));
    } else {
      notesMap = <div />;
    }
    return notesMap;
  };

  getAnecdotes = () => {
    var anecdotesMap;
    if (this.state.recipeObject.ownerAnecdotes) {
      anecdotesMap = this.state.recipeObject.ownerAnecdotes.map(
        (content, index) => <li key={index}>{content.anecdote}</li>
      );
    } else {
      anecdotesMap = <div />;
    }
    return anecdotesMap;
  };

  componentDidMount = () => {
    const recipeID = this.state.recipeID;
    console.log("Im mounting");
    recipesRef
      .child(recipeID)
      .once("value")
      .then(snapshot => {
        // console.log(snapshot.val());
        return snapshot.val();
        // return recipe.people.creatorID;
      })
      // .then(async creatorID => {
      //   // console.log("creatorID =", creatorID);
      //   return await usersRef.child(creatorID).once("value");
      // })
      .then(recipe => {
        // console.log("creator Object =", creatorObj.val());
        this.setState({
          recipeID: recipe.recipeID,
          recipeObject: recipe,
          // creatorObject: creatorObj.val()
          loaded: true,
          notes: recipe.ownerNotes[0],
          anecdotes: recipe.ownerAnecdotes[0]
        });
        console.log(recipe)
      })
      .catch(err => {
        console.log(err);
      });
    //Set default Image
    //var img = firebase.storage().ref('/images/Riffelsee.JPG').getDownloadURL()
    //.then((url) => {
    //  this.setState({ defaultImg: url });
    //}).catch(function(error) {
    //  // Handle any errors here
    //});
  };

  editRecipe = () => {
    this.props.history.push("/edit", {
      recipeID: this.state.recipeID,
      recipeObject: this.state.recipeObject
    });
  };

  shareRecipe = () => {
    // var config = {
    //   u : `http://localhost:4004${this.props.location.pathname}`
    //  };
    //  const shareLink = ShareUrl.facebook(config);
    //  window.open(shareLink);
  
    const email = prompt('Please enter the email recipient(s) to send your recipe to.\nEach address should be separated by a semicolon (;):');
    var config;
    if (this.props.username !== undefined) {
      config = {
        to : email,
        subject : this.state.recipeObject.recipe,
        body : `${this.props.username} has sent you a recipe: https://pistachio-decodemtl.firebaseapp.com${this.props.location.pathname}`
      };
    } else {
      config = {
        to : email,
        subject : this.state.recipeObject.recipe,
        body : `The above sender has sent you a recipe: https://pistachio-decodemtl.firebaseapp.com${this.props.location.pathname}`
      };
    }
  const mailLink = ShareUrl.email(config);
  // console.log(mailLink);
  window.open(mailLink);
  }


  
  render() {
    console.log(this.props.location.pathname);
    return (
      <div id="main" className="Recipe">
        {!this.state.loaded ? (
          <LoadingAnimation/>
        ) : (
          <div>
            <div className="recipeImgContainer">
              {this.getRecipeImage() !== "" ? (
                <div
                  className="recipeImg"
                  style={{ backgroundImage: `url(${this.getRecipeImage()})` }}
                />
              ) : (
                <div
                  className="recipeImg"
                  style={{ backgroundImage: `url(${this.state.defaultImg})` }}
                />
              )}
            </div>
            <div className="container">
              <h1>{this.getRecipeTitle()}</h1>
              <div className="recipeInfos">
                <p>Preparation time: {this.state.recipeObject.prepTime}</p>
                <p>Cook time : {this.state.recipeObject.cookTime}</p>
                <p>Render: {this.state.recipeObject.yieldNb} portion</p>
              </div>
              <ul className="ingredientsList">
                <h3> Ingredients </h3>
                <hr align="left" />
                {this.getRecipeIndredients()}
              </ul>
              {this.state.notes.note !== "" ? (
                <div className="notes displayDesktop">
                  <h3>Notes</h3>
                  <hr align="left" />
                  {this.getNotes()}
                </div>
              ) : null}
              <ul className="prepList">
                <h3> Preparation </h3>
                <hr align="left" />
                {this.getPrepSteps()}
              </ul>
              {this.state.notes.note !== "" ? (
                <div className="notes displayMobile">
                  <h3>Notes</h3>
                  <hr align="left" />
                  {this.getNotes()}
                </div>
              ) : null}
              {this.state.anecdotes.anecdote !== "" ? (
                <div className="anecdote">
                  <h3>Anecdotes</h3>
                  <hr align="left" />
                  {this.getAnecdotes()}
                </div>
              ) : null}
            </div>
            <div className="sideTools">
              <i onClick={this.shareRecipe} className="icon send i24" />
              {this.props.username === this.state.recipeObject.username && (
                <i onClick={this.editRecipe} className="icon edit i24" />
              )}

              <i onClick={() => window.print()} className="icon print i24" />
            </div>
          </div>
        )};
      </div>
    );
  }
}

var routedRecipePage = withRouter(RecipePage);
export default routedRecipePage;
//export default RecipePage;
