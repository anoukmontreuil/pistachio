import React, { Component } from 'react';
import firebase from "../scripts/firebase";
import { accountsRef, cookbooksRef} from "../scripts/db";
import LoadingAnimation from './LoadingAnimation';
//import { Link } from 'react-router-dom';

class Sidebar extends Component {
  constructor(props) {
      super(props);
      this.state = {
          userID: this.props.userID,
          linkSlected: "all",
          //toggleMenu: false,
          cookbooksListLoaded: false,
          cookbookObjectsloaded: false,
          userCookbooks: [],
          showAddCookbookFields: false,
          newUserCookbookNameFromSidebar: "",
          cookbookIDs: []
      }
  }

  componentWillMount = () => {
    accountsRef
    .child(`${this.state.userID}/cookbooksList`)
    .once('value')
    .then(snap => {
      if (snap.val() !== null) {
      this.setState({
        cookbookIDs: snap.val(), cookbooksListLoaded: true
      });
      let userCookbooksList = snap.val(); // snap.val() = An array of strings representing the user cookbooks' IDs
      return userCookbooksList
      } else {
        return 
      }
    })
    .then(async returnedUserCookbookList =>
      await Promise.all(returnedUserCookbookList.map(cookbookID =>
        cookbooksRef
        .child(`${cookbookID}`)
        .once('value')
        .then(snap => snap.val())
      ))
    )
    .then((userCookbooks) => {
      this.setState({ userCookbooks, cookbookObjectsloaded: true })
    })
    .catch(err => console.log("SIDEBAR - COMPONENTWILLMOUNT ERROR = ", err));
  }

  handleLinkSelect = (cookbookID) => (e) => {
    e.preventDefault();
    this.setState({ linkSlected: cookbookID });
    this.props.getSidebarSelect(cookbookID);
  }

  getCookbookTitle = idx => {
    try {
      return this.state.cookbookObjectsloaded
        ? this.state.userCookbooks[idx].title.value
        : "..."
    } catch(err) {}
  }

  toggleAddCookbookFields = () => {
    this.setState({ showAddCookbookFields: !this.state.showAddCookbookFields });
  }

  handleAddCookbook = async () => {
      this.addNewCookbookFromSidebarField.value = ""; // Clears the new cookbook name input field upon submission
      //console.log("New cookbook added")
      const db = firebase.database();
      // First, we're creating the cookbook in "Cookbooks"...
      var cookbookObj = { ownerUserID: this.props.userID,
        recipeIDs: [],
        title: {
          //prettifiedPath: setPrettifiedCookbookPath(cookbookKey),
          value: this.state.newUserCookbookNameFromSidebar
        }
      }
      const cookbookKey = await db.ref("Cookbooks/").push().key;
      db.ref(`Cookbooks/${cookbookKey}`)
      .set(cookbookObj);
      // Then, we're adding the new cookbook into the user's 'cookbooks' list on his/her account...
      const userCookbooks = this.state.cookbookIDs;
      const updatedCookbooksList = userCookbooks.concat(cookbookKey);
      //console.log("UPDATED COOKBOOKS LIST = ", updatedCookbooksList);
      db.ref(`Accounts/${this.props.userID}/cookbooksList`)
      .set(updatedCookbooksList)
      .then((result)=>{
        this.setState({
          cookbookIDs: updatedCookbooksList,
          userCookbooks: this.state.userCookbooks.concat(cookbookObj)
        })
      });

      // TODO: Refresh Cookbooks List In Sidebar
      this.toggleAddCookbookFields();
    }

  checkForCookbookNameConflict = () => {
    this.setState({ newUserCookbookNameFromSidebar: this.addNewCookbookFromSidebarField.value});
  }

  showCookbookAddButtonOnConflictClear = () => {
    try {
      //console.log("THIS.STATE.USERCOOKBOOKS =", this.state.userCookbooks);
      const userCookbookTitles = this.state.userCookbooks.map(cb => {
        return cb.title.value
      });
      userCookbookTitles.push(""); // This should not be a valid cookbook name...

      const cookbookNameIsValid = userCookbookTitles.every(
        cbt => cbt.toLowerCase() !== this.state.newUserCookbookNameFromSidebar.toLowerCase());

      if (!cookbookNameIsValid) {
        return <button disabled>Add</button>
      }
      return <button onClick={this.handleAddCookbook}>Add</button>
    } catch(err) {console.log(err)}
  }

  toggleMenu = (e) => {
    //console.log("Function Called!")
    e.preventDefault();
    this.props.sidebarState(!this.props.sidebarState);
    //this.setState({toggleMenu: !this.state.toggleMenu})
    
  }

  render() {
    return (
      <aside className="cookbookMarks" key={this.state.key}>
      <a className="menuBtn" onClick={this.toggleMenu}>
        <i id="navIcon" >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </i>
      </a>
      <h3>Cookbooks</h3>
        <ul>
          <li onClick={this.handleLinkSelect("all")}
              className={
                this.state.linkSlected === "all" ?
                  "selected"
                  :
                  ""
              }
          >All recipes</li>
          { this.state.cookbooksListLoaded
            ? (this.state.cookbookIDs.map((cookbookID, idx) => (
              <li onClick={this.handleLinkSelect(cookbookID)}
              key={idx}
                className={
                  this.state.linkSlected === cookbookID ?
                  "selected"
                  :
                  ""
                }
              >
                {
                  this.state.cookbookObjectsloaded
                  ? `${this.getCookbookTitle(idx)}` : null
                }
              </li>
              )))
            : <LoadingAnimation/> }
        </ul>
        {
          this.state.showAddCookbookFields
          ? <div className="addCookbook">
              <input 
                type="text" 
                ref={ancfsf => this.addNewCookbookFromSidebarField = ancfsf}
                placeholder="New Cookbook Name"
                onChange={this.checkForCookbookNameConflict}/>
              <div>
                <button onClick={this.toggleAddCookbookFields} className="tertiaryBtn">Cancel</button>
                {this.showCookbookAddButtonOnConflictClear()}
              </div>
            </div>
          : <a onClick={this.toggleAddCookbookFields}>Create a new cookbook</a>}
      </aside>
    )
  }
}

  export default Sidebar;