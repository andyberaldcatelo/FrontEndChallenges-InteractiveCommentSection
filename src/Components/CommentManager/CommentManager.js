import React, { useState, useEffect, useRef } from "react";
import classes from "./CommentManager.module.css";
import User from "../User/User";

export default function CommentManager(props) {
  const [userInput, setUserInput] = useState("");
  const textInputRef = useRef("");

  /**
   * Handling focus and value of the text input when replying to someone
   */
  useEffect(() => {
    if (props.replyingTo !== null && props.replyingTo !== undefined) {
      textInputRef.current.focus();
      setUserInput(`@${props.replyingTo}`);
      return;
    }
  }, [props.isReplyButtonClicked, props.replyingTo]);

  /**
   * Handling focus and value of the text input when editing a comment
   */

  useEffect(() => {
    if (props.editingData !== undefined && props.editingData !== null) {
      textInputRef.current.focus();
      setUserInput(props.editingData.comment.data);
    }
  }, [props.editingData]);

  /**
   * Handling the size of the textarea
   */
  useEffect(() => {
    let height = "20px";
    if (userInput.length < 40) {
      textInputRef.current.style.height = height;
      return;
    }
    if (userInput.length > 320) {
      textInputRef.current.style.height = "160px";
      return;
    }
    height = `${Math.ceil(userInput.length / 40) * 20}px`;
    textInputRef.current.style.height = height;
  }, [userInput]);

  const removeFocus = () => {
    textInputRef.current.blur();
  };

  /**
   * Case --> User edit a comment
   * Filling the input text with the content of the comment we want to edit according to the value of editingData
   */
  useEffect(() => {
    if (props.editingData !== null && props.editingData !== undefined) {
      if (props.editingData.comment.quote !== undefined) {
        let content = props.editingData.comment.quote.concat(
          "",
          props.editingData.comment.content
        );
        setUserInput(content);
      } else {
        setUserInput(props.editingData.comment.content);
      }
    }
  }, [props.editingData]);

  // 3 uses-cases are possible
  const onUserSubmit = () => {
    // setUserInput(textInputRef.current.value);

    // 1# User is just creating a brand new top level comment --> replyingTo is null so we call the function for creating the comment with the userInput and reset the text in the input
    if (
      props.replyingTo === null &&
      props.commentId === null &&
      props.editingData === null
    ) {
      props.handleUserComment(userInput);
      setUserInput("");
      return;
    }

    // 2# User is replying to a comment --> replyingTo is not null so we call the function for replying to a comment, then we clear the text in the input
    if (props.replyingTo !== null) {
      props.handleUserReply(
        userInput,
        props.replyingTo,
        props.commentId,
        props.rootCommentId
      );
      setUserInput("");
      return;
    }

    // 3# User is editing his own comment --> replyingTo is null
    if (props.editingData !== null && props.editingData !== undefined) {
      props.handleEditComment(userInput);
      setUserInput("");
    }
  };

  return (
    <div className={classes.CommentManagerContainer}>
      <textarea
        className={classes.TextBox}
        type="text"
        ref={textInputRef}
        placeholder="Add a comment..."
        onFocus={() => props.rebootReplyButtonState()}
        onClick={() => props.rebootReplyButtonState()}
        value={userInput}
        onBlur={removeFocus}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyUp={(e) => {
          e.preventDefault();
          if (e.key === "Enter") {
            onUserSubmit(e.target.value);
            setUserInput((prevState) => "");
          }
        }}
      />
      <div className={classes.SubmitArea}>
        <User userVersion="avatar" user={props.currentUser} />
        <button onClick={() => onUserSubmit()} className={classes.Submit}>
          Send
        </button>
      </div>
    </div>
  );
}
