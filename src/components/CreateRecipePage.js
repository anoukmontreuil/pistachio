import React, { Component } from "react";
import firebase from "../scripts/firebase";
import Textarea from "react-textarea-autosize";
import { accountsRef, cookbooksRef, setPrettifiedCookbookPath } from "../scripts/db";
// import Cookbook from "./Cookbook";
//import { Link } from 'react-router-dom';

class CreateRecipePage extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      username: props.username,
      recipe: "",
      cookbook: "",
      cookTime: "",
      prepTime: "",
      cookBookID: "123",
      img: "",
      ownerAnecdotes: [
        {
          anecdote: ""
        }
      ],
      ownerNotes: [
        {
          note: ""
          
        }
      ],
      people: {
        authorID: "0",
        creatorID: "1"
      },
      starRating: "4.5",
      yieldNb: "6",
      title: {
        prettifiedPath: "al-and-mon",
        value: "Al & Mon"
      },
      tags: {
        defaultTags: [{ 0: "dessert" }],
        personalTags: [{ 0: "favourite" }]
      },
      ingredients: [
        {
          qty: "",
          unit: "",
          ingr: ""
        }
      ],
      prep: [{ step: "" }]
    };
    this.state = this.initialState;
    this.editRecipe = false;
  }

  componentWillMount = () => {
    this.getCookbooks();
    localStorage.removeItem('state')
  }

  componentDidMount() {
    //get localstorage state and set it
    // console.log(this.props.location.state);
    if (this.props.location.state) {
      this.setAppState(this.props.location.state.recipeObject);
    } else {
      const state = JSON.parse(localStorage.getItem("state"));
      this.setAppState(state);
    }
  }

  setAppState = state => {
    this.setState(state, () => {
      localStorage.setItem("state", JSON.stringify(this.state));
    });
  };

  writeRecipe = async recipe => {
    const db = firebase.database(); 

    // *** Check for a potential cookbook transfer first ***

    // [ ...GATHERING REQUIRED DATA... ]

    // Step 1 : Get the selected cookbooks's ID...
    const selectedCookbook = this.state.cookbook;

    // Step 2 : Get the list of existing recipes in the new/selected cookbook...
    let recipeIDsFromSelectedCookbook = []; // Used for both recipeID content edits and cookbook transfers; so this is the first step.
    console.log("*** SELECTED COOKBOOK ID = ", selectedCookbook);
    await db.ref(`Cookbooks/${selectedCookbook}`)
    .child('recipeIDs')
    .once("value", snap => {
      if (snap.val() !== null && snap.val() !== undefined) {
        //console.log("recipeIDsFromSelectedCookbook =", recipeIDsFromSelectedCookbook);
        console.log("Cookbooks > Selected Cookbook > RecipeIDs Value =", snap.val());
        recipeIDsFromSelectedCookbook.push(...snap.val()); // "= Recipes already in the user's selected cookbook"
      }
      console.log("[ STEP 1 ] recipeIDsFromSelectedCookbook =", recipeIDsFromSelectedCookbook);
    });

    // Step 3 : Get the current recipe's ID
    const recipeID = this.state.recipeID;

    // Step 4 : Query the value of the recipeID's *current* cookbookID
    let originalCookbookForRecipeID;
    await db.ref(`Recipes/${recipeID}/cookbook`)
    .once("value", snap => {
      originalCookbookForRecipeID = snap.val();
      console.log("[ STEP 4 ] originalCookbookForRecipeID =", originalCookbookForRecipeID);
    });

    // Step 5 : Evaluate whether the selected cookbookID and the current cookbook ID are the same.
    const cookbookTransferIsRequired = selectedCookbook !== originalCookbookForRecipeID
    if (cookbookTransferIsRequired) { // If they're different : we can proceed with the cookbook transfer on the DB...
      
      // Step 6 : Get the array of recipes in the original cookbook (from step 3);
      let recipeIDsFromOriginalCookbook = [];
      await db.ref(`Cookbooks/${originalCookbookForRecipeID}`)
      .child('recipeIDs')
      .once("value", snap => {
        if (snap.val() !== null && snap.val() !== undefined) {
          recipeIDsFromOriginalCookbook.push(...snap.val()); // "= Recipes already in the original cookbook"
        }
        console.log("[ STEP 6 ] recipeIDsFromOriginalCookbook =", recipeIDsFromOriginalCookbook);
      });

      // * PART I >>> Removing the recipeID from the original cookbook's recipeIDs list,
      //               then pushing the updated list back to the original cookbook *

      // Step 7 : First flatten the original cookbooks's recipeIDs (gathered at step # 6)...
      const flattenedrecipeIDsFromOriginalCookbook = [].concat.apply([], recipeIDsFromOriginalCookbook);

      // Step 8 : In the flattened array from steps # 6-11, get the index of the recipeID we're transfering...
      const recipeIDIndexInOriginalCookbook = flattenedrecipeIDsFromOriginalCookbook.indexOf(recipeID);

      // Step 9 : Remove the recipeID entry from the array of recipeIDs for the original cookbook...
      flattenedrecipeIDsFromOriginalCookbook.splice(recipeIDIndexInOriginalCookbook, 1);

      // Step 10 : Convert the modified array back into an object prior to setting the list back into the database for the original cookbook...
      const recipeIDsFromOriginalCookbookObject = {};
      flattenedrecipeIDsFromOriginalCookbook.forEach((recipeIDEntry, recipeIDEntryIndex) => {
        return Object.assign(recipeIDsFromOriginalCookbookObject, 
              { [recipeIDEntryIndex]: recipeIDEntry }
        );
      });

      // Step 11 : Set updated recipeIDs list back to the original cookbook's 'recipesIDs' on the database...
      db.ref(`Cookbooks/${originalCookbookForRecipeID}/recipeIDs`).set(recipeIDsFromOriginalCookbookObject);
    
    // * END OF COOKBOOK UPDATE 'IF' BLOCK ! *
    }

    // * PART II >>> Updating the recipeIDs on the new/selected cookbook *

    // Step 12 : Check whether the recipeKey/ID already exists in our state.
    //           This is required to get the appropriate key, depending on 
    //           whether we're dealing with a NEW RECIPE or a RECIPE THAT NEEDS UPDATING...
    const recipeKey = this.state.recipeID // "If the recipeKey already exists..." // ? Dubious... Might just be 'this.state.recipeID'
    ? this.state.recipeID // ? Dubious... Might just be 'this.state.recipeID'
    : await db.ref("Recipes/").push().key; // "If the recipeKey does not already exist, set it in the DB and assign it to 'recipeKey'..."
    
    // Step 13 : Regardless of whether the key is new ('RECIPE CREATION') or already exists ('RECIPE EDIT'): 
    //           We will be setting the updated recipe data on the database via a 'SET'...
    db.ref(`Recipes/${recipeKey}`).set({ ...recipe, recipeID: recipeKey });

    // The above takes care of the 'RECIPE' side of things...
    // To complete the process, we need to handle this creation/update 
    // within the selected cookbook for that recipe...

    // Step 14 : Flatten the recipeIDsFromSelectedCookbook (back from step # 2) for proper transformation...
    const flattenedrecipeIDsFromSelectedCookbook = [].concat.apply([], recipeIDsFromSelectedCookbook);
    console.log("recipeIDsFromSelectedCookbook =", recipeIDsFromSelectedCookbook)

    // Step 15 : If we're in 'edit' mode, push the recipeKey/ID to new cookbook's recipeIDs array...
    if (!flattenedrecipeIDsFromSelectedCookbook.includes(recipeKey)) { // "If user is in edit recipe mode: we won't push the recipe as a new object in firebase"
      flattenedrecipeIDsFromSelectedCookbook.push(recipeKey);
      console.log("flattenedrecipeIDsFromSelectedCookbook AFTER UPDATE =", flattenedrecipeIDsFromSelectedCookbook);
    }

    // Step 16 : Step 16 : Convert the flattened array back into an object prior to setting the list back into the database for the selected cookbook...
    const recipeIDsFromSelectedCookbookObject = {};
      flattenedrecipeIDsFromSelectedCookbook.forEach((recipeIDEntry, recipeIDEntryIndex) => {
        return Object.assign(recipeIDsFromSelectedCookbookObject, 
              { [recipeIDEntryIndex]: recipeIDEntry }
        );
      });

    // Step 17 : Set updated recipeIDs list back to the new/selected cookbook's 'recipesIDs' on the database...
    db.ref(`Cookbooks/${selectedCookbook}/recipeIDs`).set(recipeIDsFromSelectedCookbookObject);
  };


  addImage = async img => {
    try {// console.log(img)
    const storageRef = firebase.storage().ref("images/" + img.name);
    const snapshot = await storageRef.put(img);
    // console.log('Uploaded a blob or file!', snapshot);
    this.setAppState({ img: snapshot.downloadURL });
    } 
    catch(err) {}
  };

  handleNewCookbookInputChange = event => {
    const target = event.target;
    const value = target.value;

    this.setAppState({
      newUserCookbookName: value
    });
  };

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setAppState({
      [name]: value
    });
  };

  handleImageInput = event => {
    this.addImage(event.target.files[0]);
  };

  formatArray = arr =>
    arr.reduce((acc, curr, index) => {
      return { ...acc, [index]: curr };
    }, {});

  handleSubmit = async event => {
    event.preventDefault();
    // alert('A recipe was submitted: ' + this.state.recipe);
    const recipe = {
      ...this.state,
      ingredients: this.formatArray(this.state.ingredients),
      prep: this.formatArray(this.state.prep),
      ownerNotes: this.formatArray(this.state.ownerNotes)
    };

    console.log("SUBMITTED RECIPE OBJECT = ", recipe);
    try {
      // console.log(this.props);
      // if (!this.props.recipeID) {
        await this.writeRecipe(recipe);
      // } else {
      //   await this.editRecipe(recipe, this.props.recipeID);
      // }
      //reset state
      this.setAppState(this.initialState);
    } catch (err) {
      //console.log(err);
    }
    this.props.history.push("/")
  };

  //dynamic forms from: https://goshakkk.name/array-form-inputs/

  handleIngredientChange = (idx, type) => evt => {
    const newIngredients = this.state.ingredients.map((ingredient, sidx) => {
      if (idx !== sidx) return ingredient;
      else if (type === "qty") return { ...ingredient, qty: evt.target.value };
      else if (type === "unit")
        return { ...ingredient, unit: evt.target.value };
      else if (type === "ingr")
        return { ...ingredient, ingr: evt.target.value };
      else return null;
    });

    this.setAppState({ ingredients: newIngredients });
  };

  handleAddIngredient = () => {
    this.setAppState({
      ingredients: this.state.ingredients.concat([
        { qty: "", unit: "", ingr: "" }
      ])
    });
  };

  handleRemoveIngredient = idx => () => {
    this.setAppState({
      ingredients: this.state.ingredients.filter((s, sidx) => idx !== sidx)
    });
  };

  handleStepChange = idx => evt => {
    const newStep = this.state.prep.map((step, sidx) => {
      if (idx !== sidx) return step;
      else return { ...step, step: evt.target.value };
    });

    this.setAppState({ prep: newStep });
  };

  handleAddStep = () => {
    this.setAppState({
      prep: this.state.prep.concat([{ step: "" }])
    });
  };

  handleRemoveStep = idx => () => {
    this.setAppState({
      prep: this.state.prep.filter((s, sidx) => idx !== sidx)
    });
  };

  handleNoteChange = idx => evt => {
    const newNote = this.state.ownerNotes.map((ownerNotes, sidx) => {
      if (idx !== sidx) return ownerNotes;
      else return { ...ownerNotes, note: evt.target.value };
    });

    this.setAppState({ ownerNotes: newNote });
  };

  handleAddNote = () => {
    this.setAppState({
      ownerNotes: this.state.ownerNotes.concat([{ note: "" }])
    });
  };

  handleRemoveNote = idx => () => {
    this.setAppState({
      ownerNotes: this.state.ownerNotes.filter((s, sidx) => idx !== sidx)
    });
  };

  handleAnecdotesChange = idx => evt => {
    const newAnecdote = this.state.ownerAnecdotes.map((ownerAnecdotes, sidx) => {
      if (idx !== sidx) return ownerAnecdotes;
      else return { ...ownerAnecdotes, anecdote: evt.target.value };
    });

    this.setAppState({ ownerAnecdotes: newAnecdote });
  };

  handleAddAnecdote = () => {
    this.setAppState({
      ownerAnecdotes: this.state.ownerAnecdotes.concat([{ anecdote: "" }])
    });
  };

  handleRemoveAnecdote = idx => () => {
    this.setAppState({
      ownerAnecdotes: this.state.ownerAnecdotes.filter((s, sidx) => idx !== sidx)
    });
  };

  handleNewCookbookAddition = async evt  => {
    evt.preventDefault();
    this.newCookbookInputField.value = ""; // Clears the new cookbook name input field upon submission

    const db = firebase.database();
    // First, we're creating the cookbook in "Cookbooks"...
    const cookbookKey = await db.ref("Cookbooks/").push().key;
    db.ref(`Cookbooks/${cookbookKey}`)
    .set(
      { ownerUserID: this.props.userID,
        recipeIDs: [],
        title: {
          prettifiedPath: setPrettifiedCookbookPath(cookbookKey),
          value: this.state.newUserCookbookName
        }
      }
    );
    this.setAppState({
      cookbook: cookbookKey,
    });
    // Then, we're adding the new cookbook into the user's 'cookbooks' list on his/her account...
    const userCookbooks = this.state.cookbookIDs;
    const updatedCookbooksList = userCookbooks.concat(cookbookKey);
    // console.log("UPDATED COOKBOOKS LIST = ", updatedCookbooksList);
    db.ref(`Accounts/${this.props.userID}/cookbooksList`)
    .set(updatedCookbooksList);

    // Finally: Update the state with the updated list of cookbookIDs...
    this.getCookbooks();
  }

  getCookbooks = () => {
    accountsRef
    .child(`${this.props.userID}/cookbooksList`)
    .once('value')
    .then(snap => {
      this.setAppState({
        cookbookIDs: snap.val(), cookbooksListLoaded: true,
      })
      return snap.val() ; // snap.val() = An array of strings representing the user cookbooks' IDs
    })
    .then(async returnedUserCookbookList =>
      await Promise.all(returnedUserCookbookList.map(cookbookID =>
        cookbooksRef
        .child(`${cookbookID}`)
        .once('value')
        .then(snap => snap.val()) // An array of own cookbook object(s) returned from the database.
      ))
    )
    .then((userCookbooks) => {
      this.setAppState({ userCookbooks, cookbookObjectsloaded: true })
    })
    .catch();
  }

  getSelectableCookbooksList = () => {
    const defaultUnselectableOption = [<option selected>Select A Cookbook...</option>]
    const newCookbookSelectableOption = <option value="newCookbook">Create New Cookbook...</option>

    try {
      const selectableCookbooks = [];

      if (this.state.cookbookObjectsloaded) {
        this.state.userCookbooks.forEach(cookbook => {
          selectableCookbooks.push(cookbook.title.value)
        });
      }

      const selectOptions = selectableCookbooks.map((cookbookTitle, cbIdx) => {
            return <option key={cbIdx} value={this.state.cookbookIDs[cbIdx]}>{cookbookTitle}</option>
      });

      return defaultUnselectableOption
              .concat(selectOptions)
              .concat(newCookbookSelectableOption)

    } catch(err) { 
      //console.log(err);
      return (newCookbookSelectableOption)
    }
  }

  checkForCookbookNameConflict = () => {
    const userCookbookTitles = this.state.userCookbooks.map(cb => {
      console.log("Cookbook Title Value =", cb.title.value);
      return cb.title.value
    });
    userCookbookTitles.push("Create New Cookbook...", ""); // These should not be valid cookbook names...
    let cookbookNameIsValid; // AM
    try { // AM
      cookbookNameIsValid = userCookbookTitles.every(cbt => cbt.toLowerCase() !== this.state.newUserCookbookName.toLowerCase()); // AM
    } catch(err) { console.log(err); return false } // AM
    
    if (!cookbookNameIsValid) {
      return <button disabled>Add Cookbook</button>
    }
    return <button onClick={this.handleNewCookbookAddition}>Add Cookbook</button>
  }

  cancelRecipe = () => {
    this.setAppState( this.initialState )
    this.props.history.push("/")
  }

  deleteRecipeFromCookbook = async (recipeID) => {
    console.log("test1 should return recipe ID: ", recipeID )
    var temp;
    await cookbooksRef
    .once("value")
    .then(snapshot => {
      // console.log(snapshot.val());
      temp = snapshot.val();
      // console.log("test2 should return the complete DB: ", temp);
      Object.keys(temp).forEach((key) => {
        if (temp[key]) {

        
          if(temp[key].recipeIDs) {
            // console.log("test3 should return recipe ID list of present user: ", temp[key].recipeIDs)
            for(var i = 0; i < Object.keys(temp[key].recipeIDs).length; i++) {
              // console.log("test4 should return present recipe inspected: ", temp[key].recipeIDs[Object.keys(temp[key].recipeIDs)[i]])
              if(recipeID === temp[key].recipeIDs[Object.keys(temp[key].recipeIDs)[i]]) {
                // console.log("_____")
                // console.log("_____")
                // console.log("_____")
                // console.log("test5 MATCH")
                // console.log("_____")
                // console.log("_____")
                // console.log("_____")
                delete temp[key].recipeIDs[Object.keys(temp[key].recipeIDs)[i]]
              }
            }
          }
        }
      })
      cookbooksRef.set(temp);
  })
}


  deleteRecipe = async () => {
     if (window.confirm("Are you sure you wish to delete this item?")) {
      const db = firebase.database();
      await db.ref("Recipes/" + this.state.recipeID).remove();
      // db.ref("Cookbooks/" + this.state.cookbook + "/" + this.state.recipeID).remove();
      await this.deleteRecipeFromCookbook(this.state.recipeID);
      localStorage.removeItem('state')
      this.props.history.push("/");          
    }
  };

  removeImage = () => {
    this.setAppState({ img: "" })
  }

  render() {
    // About 'recipeEditMode' :
    // Defining whether we're in 'Edit' mode or in 'Creation' mode
    // will enable us to determine whether to display the 'Delete' button
    // in the footer ('BottomBar')of this page.
    const recipeEditMode = this.state.recipeID !== undefined ? true : false;
    return (
      <div id="main" className="flexContain newRecipeContainer">
        <header id="cookbookSelection">
          <h2>Edit Recipe</h2>
        </header>
        <form onSubmit={this.handleSubmit} className="createRecipe">
          <label className="displayInlineBlock">
            Recipe
            <input
              name="recipe"
              type="text"
              placeholder="Recipe Name"
              value={this.state.recipe}
              onChange={this.handleInputChange}
            />
          </label>


          <label className="displayInlineBlock">
            Cookbook
            <select
              name="cookbook"
              type="text"
              value={this.state.cookbook}
              onChange={this.handleInputChange}
              ref={cbs => this.cookbookSelector = cbs}
            >
              {this.getSelectableCookbooksList()}
            </select>
            {this.state.cookbook === "newCookbook" 
              ? 
                <div>
                  <input 
                    ref={ncbif => this.newCookbookInputField = ncbif} 
                    placeholder="Your new cookbook's name here"
                    onChange={this.handleNewCookbookInputChange}/>
                  <div>{this.checkForCookbookNameConflict()}</div>
                </div> 
              : null}
          </label>

          <h3>Ingredients</h3>
          {this.state.ingredients.map((ingredient, idx) => (
            <div className="ingredient">
              <input
                type="text"
                placeholder={"Quantity"}
                value={ingredient.qty}
                key={idx}
                className="ingredientQuantity"
                onChange={this.handleIngredientChange(idx, "qty")}
              />
              <select
                type="text"
                value={ingredient.unit}
                onChange={this.handleIngredientChange(idx, "unit")}
              >
                <option value="unit">Unit</option>
                <option value="cups">cups</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
              </select>
              <input
                type="text"
                placeholder={`Ingredient #${idx + 1}`}
                value={ingredient.ingr}
                className="ingredientItem"
                onChange={this.handleIngredientChange(idx, "ingr")}
              />

              <button
                type="button"
                onClick={this.handleRemoveIngredient(idx)}
                className="small icon close i18"
              >
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={this.handleAddIngredient}
            className="small"
          >
            Add Ingredient
          </button>

          <h3>Preparation</h3>
          {this.state.prep.map((prep, idx) => (
            <div className="step">
              <Textarea
                type="text"
                placeholder={`Step #${idx + 1}`}
                value={prep.step}
                key={idx}
                onChange={this.handleStepChange(idx)}
              />
              <button
                type="button"
                onClick={this.handleRemoveStep(idx)}
                className="small icon close i18"
              >
              </button>
            </div>
          ))}
          <button type="button" onClick={this.handleAddStep} className="small">
            Add Step
          </button>
          <div>
            <label className="displayInlineBlock">
              Image
              <input
                name="image"
                type="file"
                className="selectImgInput"
                // value={this.state.image}
                onChange={this.handleImageInput}
                // ref={r => this.img = r}
              />
            </label>
            {this.state.img !== "" && (
              <img src={this.state.img} alt="uploaded recipe img" />
            )}
            
          </div>
          {this.state.img !== "" && (
          <button className="removeImage" onClick={this.removeImage}>Remove image</button>
          )}
          <label>
            Preparation time
            <input
              name="prepTime"
              type="text"
              placeholder="Estimated preparation time"
              value={this.state.prepTime}
              onChange={this.handleInputChange}
            />
          </label>

          <label>
            Cook time
            <input
              name="cookTime"
              type="text"
              placeholder="Estimated cook time"
              value={this.state.cookTime}
              onChange={this.handleInputChange}
            />
          </label>
          
          <label>
            Number of servings
            <input
              name="yieldNb"
              type="number"
              placeholder="Nb people"
              value={this.state.yieldNb}
              onChange={this.handleInputChange}
            />
          </label>

          <h3>Notes</h3>
          {this.state.ownerNotes.map((ownerNotes, idx) => (
            <div className="notes">
              <Textarea
                type="text"
                placeholder={`Note #${idx + 1}`}
                value={ownerNotes.note}
                key={idx}
                onChange={this.handleNoteChange(idx)}
              />
              <button
                type="button"
                onClick={this.handleRemoveNote(idx)}
                className="small icon close i18"
              >
              </button>
            </div>
          ))}
          <button type="button" onClick={this.handleAddNote} className="small">
            Add Note
          </button>

          <h3>Anecdotes</h3>
          {this.state.ownerAnecdotes.map((ownerAnecdotes, idx) => (
            <div className="notes">
              <Textarea
                type="text"
                placeholder={`Anecdotes #${idx + 1}`}
                value={ownerAnecdotes.anecdote}
                key={idx}
                onChange={this.handleAnecdotesChange(idx)}
              />
              <button
                type="button"
                onClick={this.handleRemoveAnecdote(idx)}
                className="small icon close i18"
              >
              </button>
            </div>
          ))}
          <button type="button" onClick={this.handleAddAnecdote} className="small">
            Add anecdote
          </button>

          <div className="bottomBar">
            { recipeEditMode 
              ? <button type="button" onClick={this.deleteRecipe} className="deleteBtn">Delete</button> 
              : <div className="deleteBtn"></div> 
            }
            <div>
              <button type="reset" value="Cancel" onClick={this.cancelRecipe} className="cancelBtn">Cancel</button>     
              { this.state.cookbook === "" || this.state.cookbook === "newCookbook" || this.state.cookbook === "Select A Cookbook..." ? 
                <button disabled className="saveBtn disabled">
                  <a href='#cookbookSelection'>Select A Cookbook Before Saving</a>
                </button> 
                : 
                <button type="submit" value="Submit" className="saveBtn">Save Recipe</button>
              }
            </div>
          </div>
        </form>
      </div>
    );
  }
}
export default CreateRecipePage;