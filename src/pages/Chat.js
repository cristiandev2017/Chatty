import React, { Component } from "react";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { logout } from "../helpers/auth";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      chats: [],
      content: "",
      readError: null,
      writeError: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  async componentDidMount() {
    this.setState({ readError: null });
    try {
      db.ref("chats").on("value", (snapshot) => {
        let chats = [];
        snapshot.forEach((snap) => {
          chats.push(snap.val());
        });
        this.setState({ chats });
      });
    } catch (error) {
      this.setState({ readError: error.message });
    }
  }

  handleChange(event) {
    this.setState({
      content: event.target.value,
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    try {
      await db.ref("chats").push({
        content: this.state.content,
        timestamp: Date.now(),
        uid: this.state.user.uid,
      });
      this.setState({ content: "" });
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  render() {
    return (
      <div>
        <div className="chat-area">
          {this.state.chats.map((chat) => {
            return <p key={chat.timestamp}>{chat.content}</p>;
          })}
        </div>
        <form onSubmit={this.handleSubmit} className="mx-3">
          <textarea
            className="form-control"
            onChange={this.handleChange}
            value={this.state.content}
          ></textarea>
          {this.state.error ? <p>{this.state.writeError}</p> : null}
          <button type="submit" className="btn btn-submit px-5 mt-4">
            Send
          </button>{" "}
        </form>
        <div className="py-5 mx-3">
          Login in as: <strong className="text-info">{this.state.user.email}</strong>
          <br />
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }
}
