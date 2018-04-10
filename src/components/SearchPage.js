import React, { Component } from "react";
//import { Link } from 'react-router-dom';
// import SidebarSearch from "./SidebarSearch";
// import Cookbook from "./Cookbook";
import RecipeCard from "./RecipeCard";
import { recipesRef } from "../scripts/db";
// import firebase from "../scripts/firebase";
import LoadingAnimation from './LoadingAnimation';

class SearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsFound: [],
      myItemsFound: [],
      recipeObject: {},
      loaded: false
    };
  }

  componentDidMount() {
    const searchTerm = new URLSearchParams(this.props.location.search).get(
      "searchTerm"
    );

    //fetch data
    recipesRef
      .once("value")
      .then(snapshot => {
        return snapshot.val();
        // console.log(recipes)
        // return recipe.people.creatorID;
      })
      // .then(userID => {
      //   return accountsRef.child(userID).once("value");
      // })
      .then((recipes) => {
        this.setState({
          recipeObject: recipes,
          // creatorObject: creatorObj.val(),
          loaded: true,
          itemsFound: []
        }, () => this.performSearch(searchTerm));
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    const searchTerm = new URLSearchParams(nextProps.location.search).get(
      "searchTerm"
    );
    //filter function on data based on search term and setState
    this.performSearch(searchTerm);
  }

  performSearch = searchTerm => {
    console.log(searchTerm, this.state)
    let wordSearch = searchTerm.toLowerCase();
    let allRecipes = this.state.recipeObject;
    console.log(allRecipes)
    var recipesFound = Object.values(allRecipes).filter(item =>
      !item.username.includes(this.props.username) && (
      item.recipe.toLowerCase().includes(wordSearch) ||
      (item.ingredients.filter(ingredient => 
        ingredient.ingr.toLowerCase().includes(wordSearch)
      ).length !== 0))
    );
    var myRecipesFound = Object.values(allRecipes).filter(item =>
      item.username.includes(this.props.username) && (
      item.recipe.toLowerCase().includes(wordSearch) ||
      (item.ingredients.filter(ingredient => 
        ingredient.ingr.toLowerCase().includes(wordSearch)
      ).length !== 0))
    );

    console.log(recipesFound)
    console.log(myRecipesFound)
    // console.log(recipesFound);
    // console.log(arrOfRecipes);
    // let arrOfCookbooks = [];
    // var booksFound = Object.values(allRecipes).filter(item =>
    //   item.username.includes(wordSearch)
    // );
    // arrOfCookbooks.push(booksFound);
    // console.log(arrOfRecipes, arrOfCookbooks);
    // let arrOfItemsFound = [arrOfRecipes, ...arrOfCookbooks]
    // console.log(arrOfItemsFound)
    // this.setState({ itemsFound: arrOfRecipes });
    this.setState({ itemsFound: recipesFound, myItemsFound: myRecipesFound, loaded: true });
  };

  render() {
    
      return !this.state.loaded ? (
        <div className="flexContain">
          {/* <SidebarSearch /> */}
          <LoadingAnimation/>
        </div>
      ) : (
        <div className="flexContain">
          {/* <SidebarSearch /> */}
          <div id="main" className="Search">
            <div className="flexContain cookBookContainer">
            <header>
              <h1>Your recipes</h1>
            </header>
              <div className="cardContain">
                {this.state.myItemsFound.map((item, idx) => (
                    <RecipeCard 
                      // key={idx}
                      recipeID={item.recipeID}
                    />
                ))}
              </div>
            </div>
            <div className="flexContain cookBookContainer otherUser">
              <header>
                <h1>Recipes from other users</h1>
              </header>
              <div className="cardContain">
                {this.state.itemsFound.map((item, idx) => (
                    <RecipeCard 
                      // key={idx}
                      recipeID={item.recipeID}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    
  }
}

export default SearchPage;
