const firebase = require('firebase');

// const config = {
//   apiKey: "AIzaSyA6JVBxq3mzdsc0gufTHxScydjHSO66TpY",
//   authDomain: "pistachio-decodemtl.firebaseapp.com",
//   databaseURL: "https://pistachio-decodemtl.firebaseio.com",
//   projectId: "pistachio-decodemtl",
//   storageBucket: "pistachio-decodemtl.appspot.com",
//   messagingSenderId: "433017313030"
// };
// firebase.initializeApp(config);

// ---------------------------------------------------------------------
// Database Nodal References...

// Root Node:
export const rootRef = firebase.database().ref();

// First Level Nodes:
export const accountsRef = rootRef.child('/Accounts');
export const authorsRef = rootRef.child('/Authors');
export const cookbooksRef = rootRef.child('/Cookbooks');
export const recipesRef = rootRef.child('/Recipes');
export const tagsRef = rootRef.child('/Tags');
export const usersRef = rootRef.child('/Users');

// // ---------------------------------------------------------------------
// // Utility functions...
// const generateID = () => {
//   const charsArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8","9"];
//   let idPrefixTemplate = "xxxxxxxxxxxxxxx";

//   const randomizer = () => {
//     let newID = "";
//     for (let i = 0; i < idPrefixTemplate.length; i++) {
//       newID += idPrefixTemplate[i].replace(/x/, charsArr[Math.floor(Math.random() * charsArr.length)]);
//     }
//     newID += `@${Date.now() / 1}`; // Appends current time after the '@' to further prevent unlikely but unfortunate conflicts
//     return newID;
//   }

//   return randomizer();
// }

// // ---------------------------------------------------------------------
// // 'Author' DB functions...
// const addAuthor = authorObject => {
//   const authorID = generateID();
// }
// const editAuthor = authorID => {}
// const getAuthor = authorID => {}
// const removeAuthor = authorID => {}
// // ---------------------------------------------------------------------
// // 'Cookbook' DB functions...
// const addCookbook = cookbookObject => {
//   const cookbookID = generateID();
//   // TODO
// }
// const editCookbook = cookbookID => {}
// const getCookbook = cookbookID => {}
// const getLastCookbookID = () => {} // Usage: to add a new author with the "next available cookbook ID".
// const removeCookbook = cookbookID => {}

export const setPrettifiedCookbookPath = async cookbookID => {
  await cookbooksRef
    .child(`${cookbookID}/title/value`)
    .on('value', snapshot => {
      console.log(snapshot.val());
      cookbooksRef.child(`${cookbookID}/title`)
      .update(
        { prettifiedPath: snapshot.val()
          .toLowerCase()
          .replace(/\s/g,"-")
          .replace(/&/g,"and")
          .replace(/!/g,"")
          .replace(/\//g,"")
          .replace(/\\/g,"")
          .replace(/@/g,"")
          .replace(/#/g,"")
          .replace(/\$/g,"")
          .replace(/%/g,"")
          .replace(/\?/g,"")
          .replace(/\*/g,"")
          .replace(/\//g,"")
          .replace(/\)/g,"")
          .replace(/\(/g,"")
          .replace(/,/g,"")
          .replace(/;/g,"")
          .replace(/'/g,"")
          .replace(/é/g,"e")
          .replace(/É/g,"e")
          .replace(/è/g,"e")
          .replace(/È/g,"e")
          .replace(/ë/g,"e")
          .replace(/Ë/g,"e")
          .replace(/ê/g,"e")
          .replace(/Ê/g,"e")
          .replace(/á/g,"a")
          .replace(/Á/g,"a")
          .replace(/à/g,"a")
          .replace(/À/g,"a")
          .replace(/ä/g,"a")
          .replace(/Ä/g,"a")
          .replace(/â/g,"a")
          .replace(/Â/g,"a")
          .replace(/ã/g,"a")
          .replace(/Ã/g,"a")
          .replace(/ó/g,"o")
          .replace(/Ó/g,"o")
          .replace(/ò/g,"o")
          .replace(/Ò/g,"o")
          .replace(/ö/g,"o")
          .replace(/Ö/g,"o")
          .replace(/ô/g,"o")
          .replace(/Ô/g,"o")
          .replace(/í/g,"i")
          .replace(/Í/g,"i")
          .replace(/ì/g,"i")
          .replace(/Ì/g,"i")
          .replace(/î/g,"i")
          .replace(/Î/g,"i")
          .replace(/ï/g,"i")
          .replace(/Ï/g,"i")
          .replace(/ñ/g,"n")
          .replace(/Ñ/g,"n")
          .replace(/æ/g,"ae")
          .replace(/Æ/g,"ae")
          .replace(/ß/g,"ss")
          .replace(/Œ/g,"oe")
          .replace(/œ/g,"oe")
        }
      )
    });
}
// // ---------------------------------------------------------------------
// // 'Recipe' DB functions...
// const addRecipe = recipeObject => {
//   const recipeID = generateID();
//   // TODO
// }
// const editRecipe = recipeID => {}
// const getRecipe = recipeID => {}
// const getLastRecipeID = () => {
// } // Usage: required to add a new author with the "next available recipe ID".
// const removeRecipe = recipeID => {}

// const setPrettifiedRecipePath = async recipeID => {
//   const titleVal = await recipesRef
//     .child(`${recipeID}/title/value`)
//     .on('value', snapshot => {
//       console.log(snapshot.val());
//       recipesRef.child(`${recipeID}/title`)
//       .update(
//         { prettifiedPath: snapshot.val()
//           .toLowerCase()
//           .replace(/\s/g,"-")
//           .replace(/&/g,"and")
//           .replace(/!/g,"")
//           .replace(/\//g,"")
//           .replace(/\\/g,"")
//           .replace(/\@/g,"")
//           .replace(/\#/g,"")
//           .replace(/\$/g,"")
//           .replace(/\%/g,"")
//           .replace(/\?/g,"")
//           .replace(/\*/g,"")
//           .replace(/\//g,"")
//           .replace(/\)/g,"")
//           .replace(/\(/g,"")
//           .replace(/\,/g,"")
//           .replace(/\;/g,"")
//           .replace(/é/g,"e")
//           .replace(/É/g,"e")
//           .replace(/è/g,"e")
//           .replace(/È/g,"e")
//           .replace(/ë/g,"e")
//           .replace(/Ë/g,"e")
//           .replace(/ê/g,"e")
//           .replace(/Ê/g,"e")
//           .replace(/á/g,"a")
//           .replace(/Á/g,"a")
//           .replace(/à/g,"a")
//           .replace(/À/g,"a")
//           .replace(/ä/g,"a")
//           .replace(/Ä/g,"a")
//           .replace(/â/g,"a")
//           .replace(/Â/g,"a")
//           .replace(/ã/g,"a")
//           .replace(/Ã/g,"a")
//           .replace(/ó/g,"o")
//           .replace(/Ó/g,"o")
//           .replace(/ò/g,"o")
//           .replace(/Ò/g,"o")
//           .replace(/ö/g,"o")
//           .replace(/Ö/g,"o")
//           .replace(/ô/g,"o")
//           .replace(/Ô/g,"o")
//           .replace(/í/g,"i")
//           .replace(/Í/g,"i")
//           .replace(/ì/g,"i")
//           .replace(/Ì/g,"i")
//           .replace(/î/g,"i")
//           .replace(/Î/g,"i")
//           .replace(/ï/g,"i")
//           .replace(/Ï/g,"i")
//           .replace(/ñ/g,"n")
//           .replace(/Ñ/g,"n")
//           .replace(/æ/g,"ae")
//           .replace(/Æ/g,"ae")
//           .replace(/ß/g,"ss")
//           .replace(/Œ/g,"oe")
//           .replace(/œ/g,"oe")
//         }
//       )
//     });
// }
// // ---------------------------------------------------------------------
// // 'Tags' DB functions...
// const addTag = async (tagName, userID) => {
//   //const tagID = generateID();
// }

// const getTag = async (tagID, userID) => {}
// const removeTag = tagID => {}
// // ---------------------------------------------------------------------
// // 'Users' DB functions...
// // No need for 'addUser' with the auth API.
// const editUser = userID => {}
// const getUser = userID => {}
// const getLastUserID = () => {} // Usage: required to add a new author with the "next available user ID".
// const removeUser = userID => {}
// // ---------------------------------------------------------------------
// // 'Search' DB functions...
// const searchFor = (searchTerm, searchIn) => {} // Not sure if we'll need to make use of 'searchIn'... We can remove it if we deem it unnecessary later on.
// // ---------------------------------------------------------------------
// // 'Timestamps' DB functions (May apply to different types of objects)
// const addCreatedByUserID = (objectType, userID) => {
//   switch (objectType) {
//     case "cookbook":
//     case "recipe":
//       addCreationTimeStamp(objectType);
//     default: return "Invalid Object Type!";
//   }
// }
// const addCreationTimeStamp = objectType => {
//   //TODO

// }
// const addModifiedByUserID = (objectType, userID) => {
//   switch (objectType) {
//     case "cookbook":
//     case "recipe":
//       addCreationTimeStamp(objectType);
//     default: return "Invalid Object Type!";
//   }
// }
// const addLastModifiedTimeStamp = objectType => {
//   //TODO
// }
// // --------------------------------------


// //setPrettifiedCookbookPath(0);
// //setPrettifiedRecipePath(0);
// //console.log(generateID());
