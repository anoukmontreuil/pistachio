import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
import { accountsRef } from "../scripts/db";
import Sidebar from './Sidebar';
import Cookbook from './Cookbook';

class HomePage extends Component {
    constructor(props) {
      super(props);
      this.state = {
        sidebarSelect: "all",
        toggleSidebar: true,
        cookbookIDs: ["newCookbook"],
        cookbooksFetchedFromDB: false
      }
    }

    setUserCookbookIDs = async () => {
      await accountsRef
      .child(`${this.props.userID}/cookbooksList`)
      .on('value', snap => {
        if (snap.val() !== null) { 
          this.setState({ cookbookIDs: snap.val(), cookbooksFetchedFromDB: true })
        }
      })
    }

    getUserCookbookIDs = () => {
      return this.state.cookbookIDs;
    }

    getSidebarSelect = (stateFromSidebar) => {
      this.setState({sidebarSelect: stateFromSidebar})
    }

    renderAllCookbooks = () => {
      if (this.state.cookbooksFetchedFromDB) {
        return (
          this.state.cookbookIDs.map((cookbookID, idx) => (
            <Cookbook 
              cookbookID={cookbookID}
              history={this.props.history}
              key={idx}
              
              isHidden={
                this.state.sidebarSelect === "all" ? false :
                this.state.sidebarSelect === cookbookID ? false :
                true
              }
            />
          ))
        )
      }
    }

    componentWillMount = () => {
      this.setUserCookbookIDs();
    }

    toggleSidebar = () => {
      this.setState({toggleSidebar : !this.state.toggleSidebar});
    }

    getContainerClassName = () => {
      return this.state.toggleSidebar ? "flexContain hideMenu" : "flexContain"
    }

    render() {
      return (
        <div className={this.getContainerClassName()}>
          <Sidebar 
            userID={this.props.userID}
            username={this.props.username}
            getSidebarSelect={this.getSidebarSelect}
            sidebarState={this.toggleSidebar}
          />
          <div id="main" className="Home">
            {this.renderAllCookbooks()}
          </div>
        </div>
      )
    }
  }

  export default HomePage;