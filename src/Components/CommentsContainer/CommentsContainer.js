import React, { useState, useEffect } from "react";
import Comment from "../Comment/Comment";
import CommentManager from "../CommentManager/CommentManager";
import classes from "./CommentsContainer.module.css";
import {
  isThereAQuote,
  extractQuote,
  doesQuoteMatchDatabase,
  doesQuoteMatchWithUsername,
  extractContent,
} from "../../Utility";

export default function CommentsContainer(props) {
  const [comments, setComments] = useState([...props.comments]); // Database of comments received from data.json
  const [usernames, setUsernames] = useState([]);
  const [isReplyButtonClicked, setIsReplyButtonClicked] = useState(false); //  Bool that states whether or not we just clicked the replyButton
  const [replyingTo, setIsReplyingTo] = useState(null); // Nickname/pseudo of the user one is replying to
  const [commentId, setCommentId] = useState(null); // The id of the comment we answered --> sometimes commentId & rootCommentId are the same
  const [isReplyingToAReply, setIsReplyingToAReply] = useState(null);
  const [rootCommentId, setRootCommentId] = useState(null); // Id of the comment  at the level 0 ( the original comment after which others answered to)
  const [editingData, setEditingData] = useState(null); // Hole data (properties & functions) that are used to edit a specific comment
  let jsxComment = null; // Comments that will be displayed via JSX

  ////// Side Effects ////////
  /**
   * Setting up the usernames array
   *  Getting every username in the database while making sure each username is unique
   */
  useEffect(() => {
    let newUsernames = [...usernames];
    comments.forEach((comment) => {
      if (
        comment.user.username !== undefined &&
        !newUsernames.includes(comment.user.username)
      )
        newUsernames.push(comment.user.username);

      // Depth -1
      if (comment.replies.length > 0 && comment.replies !== undefined) {
        comment.replies.forEach((reply) => {
          if (!newUsernames.includes(reply.user.username))
            newUsernames.push(reply.user.username);
        });
      }
    });
    setUsernames(newUsernames);
  }, [comments]);

  ////// Functions ////////
  const handleClickReply = (
    username,
    commentId,
    isReplyingToAReply = false,
    rootCommentId
  ) => {
    setIsReplyButtonClicked(true);
    setIsReplyingTo(username);
    setCommentId(commentId);
    setIsReplyingToAReply(isReplyingToAReply);
    setRootCommentId(rootCommentId);
  };

  // if rootCommentId is null, we just scan the 1st level of width of comments and delete comments[id]
  // else rootCommentId exists, we scan the 2nd level of width of comments and delete comments[rootCommentId].replies[id]
  const handleDelete = (id, rootCommentId = null) => {
    let newCommentsArr = [...comments];
    if (rootCommentId === null || rootCommentId === undefined) {
      newCommentsArr.splice(id, 1);
      setComments(newCommentsArr);
      return;
    }
    newCommentsArr[rootCommentId].replies.splice(id, 1);
    setComments(newCommentsArr);
    return;
  };

  const handleEditClick = (commentProps) => {
    setEditingData(commentProps);
  };

  const handleEditComment = (updatedContent) => {
    let content = "";
    let isThereQuote = isThereAQuote(updatedContent);
    let quote = null;
    let newComment = null;

    // There is a quote and it exists exists in the usernames database
    if (
      isThereQuote.bool === true &&
      doesQuoteMatchDatabase(isThereQuote.quote, usernames) === true
    ) {
      quote = isThereQuote.quote;
      content = extractContent(updatedContent);
      newComment = {
        ...editingData.comment,
        content: content,
        quote: quote,
      };
    }

    // There is a quote, but it does not exists in usernames database
    if (
      isThereQuote.bool === true &&
      doesQuoteMatchDatabase(isThereQuote.quote, usernames) === false
    ) {
      newComment = {
        ...editingData.comment,
        content: updatedContent,
        quote: null,
      };
    }

    // There is no quote
    if (isThereQuote.bool === false) {
      newComment = {
        ...editingData.comment,
        content: updatedContent,
        quote: null,
      };
    }

    let newComments = [...comments];
    if (
      editingData.rootCommentId !== null &&
      editingData.rootCommentId !== undefined
    ) {
      newComments[editingData.rootCommentId].replies.splice(
        newComment.id,
        1,
        newComment
      );
      setComments(newComments);
      setEditingData(null);
      return;
    }
    newComments[editingData.id] = newComment;
    setComments(newComments);
    setEditingData(null);
    return;
  };

  const rebootReplyButtonState = () => {
    setIsReplyButtonClicked(false);
  };

  const handleUserComment = (userInput) => {
    let maxId = 0;
    let newCommentsArray = [...comments];

    comments.forEach((comment, index) => {
      if (maxId <= comment.id) maxId = comment.id;
      if (index >= comments.length - 1) return maxId;
      return;
    });

    maxId++;

    let newComment = {
      id: maxId,
      content: userInput,
      createdAt: "1 min ago",
      score: 0,
      user: props.currentUser,
      replies: [],
    };
    newCommentsArray.push(newComment);

    setComments(newCommentsArray);
  };

  /**
   *
   * @param {*} userInput
   * @param {*} replyingTo
   * @param {*} commentId
   * @returns
   */
  const handleUserReply = (userInput, replyingTo, commentId, rootCommentId) => {
    // If rootCommentId is null, we reply to an original comment.  We will push the new reply in comments[commentId].replies
    // If rootCommentId is not null, we are replying to a reply. We will push the new reply in comments[rootCommentId].replies
    let pushingIndex = commentId;
    if (rootCommentId !== null && rootCommentId !== undefined) {
      pushingIndex = rootCommentId;
    }

    let id = 0;
    if (rootCommentId !== null && rootCommentId !== undefined) {
      if (comments[rootCommentId].replies.length !== undefined)
        id = comments[rootCommentId].replies.length;
    }
    if (rootCommentId === null || rootCommentId === undefined) {
      if (comments[commentId].replies.length !== undefined)
        id = comments[commentId].replies.length;
    }

    // 4 cases can occur according to what user input have typed

    let content = null;
    let doesQuoteExist = isThereAQuote(userInput);

    // 1# User does not want to quote anybody in the beggining
    // First word '@someone' in userInput does not exist --> We let userInput as it is, we create the Comment with replyingTo=replyingTo in props, and add it in the replies of pushingIndex
    if (doesQuoteExist.bool === false) {
      content = userInput;
      let newReply = {
        id: id,
        content: content,
        isReply: true,
        createdAt: "1 min ago",
        replyingTo: replyingTo,
        rootCommentId: commentId,
        score: 0,
        replies: [],
        user: props.currentUser,
      };
      let newCommentsArr = [...comments];
      newCommentsArr[pushingIndex].replies.push(newReply);
      setComments(newCommentsArr);
      return;
    }

    // 2# User used the UI correctly and did not change @someone in userInput
    // First word '@someone' in userInput matches with replyingTo --> we chop off @someone in userInput, create the Comment with replyingTo=replyingTo in props, and add it in the replies of pushingIndex.

    if (
      doesQuoteExist.bool === true &&
      doesQuoteMatchWithUsername(doesQuoteExist.quote, replyingTo) === true
    ) {
      content = extractContent(userInput);
      let newReply = {
        id: id,
        content: content,
        rootCommentId: commentId,
        isReply: true,
        quote: doesQuoteExist.quote,
        createdAt: "1 min ago",
        replyingTo: replyingTo,
        score: 0,
        replies: [],
        user: props.currentUser,
      };
      let newCommentsArr = [...comments];
      newCommentsArr[pushingIndex].replies.push(newReply);
      setComments(newCommentsArr);
      return;
    }

    // 3# User wants to reply to a comment in particular, but decides to quote someone else at the beggining
    // First word '@someone' in userInput does not match with replyingTo but matches with another username in commments. --> we chop off the wrong @someone in userInput, create the Comment with replyingTo=username in props, add it in the replies of pushingIndex ()

    if (
      doesQuoteExist.bool === true &&
      doesQuoteMatchWithUsername(extractQuote(userInput), replyingTo) ===
        false &&
      doesQuoteMatchDatabase(extractQuote(userInput), usernames) === true
    ) {
      content = extractContent(userInput);
      let newReply = {
        id: id,
        content: content,
        rootCommentId: commentId,
        isReply: true,
        createdAt: "1 min ago",
        replyingTo: replyingTo,
        quote: doesQuoteExist.quote,
        score: 0,
        replies: [],
        user: props.currentUser,
      };
      let newCommentsArr = [...comments];
      newCommentsArr[pushingIndex].replies.push(newReply);
      setComments(newCommentsArr);
      return;
    }

    // 4# User messed up the @someone in a way that it does not match with any username in the database
    // First word '@someone' in userInput does not match with replyingTo nor anothe username in comments --> We let userInput as it is, we create the Comment with replyingTo=replyingTo in props, and add it in the replies of pushingIndex
    if (
      doesQuoteExist.bool === true &&
      doesQuoteMatchWithUsername(extractQuote(userInput), replyingTo) ===
        false &&
      doesQuoteMatchDatabase(extractQuote(userInput), usernames) === false
    ) {
      content = userInput;
      let newReply = {
        id: id,
        content: content,
        rootCommentId: commentId,
        isReply: true,
        createdAt: "1 min ago",
        replyingTo: replyingTo,
        score: 0,
        replies: [],
        user: props.currentUser,
      };
      let newCommentsArr = [...comments];
      newCommentsArr[pushingIndex].replies.push(newReply);
      setComments(newCommentsArr);
      return;
    }
  };

  ////// Render ////////
  jsxComment = comments.map((comment) => {
    let replies = [...comment.replies];

    /* Guard */
    if (replies.length === 0) {
      return (
        <Comment
          id={comment.id}
          key={`${comment.id}`}
          comment={comment}
          currentUser={props.currentUser}
          handleClickReply={handleClickReply}
          handleDelete={handleDelete}
          handleEditClick={handleEditClick}
        />
      );
    }
    let repliesJSX = replies.map((reply) => {
      return (
        <Comment
          id={reply.id}
          key={`${comment.id}_${reply.id}`}
          rootCommentId={comment.id}
          replyingToId={comment.id}
          comment={reply}
          currentUser={props.currentUser}
          isReply={true}
          handleClickReply={handleClickReply}
          handleDelete={handleDelete}
          handleEditClick={handleEditClick}
        />
      );
    });

    return (
      <>
        <Comment
          id={comment.id}
          key={comment.id}
          comment={comment}
          currentUser={props.currentUser}
          handleClickReply={handleClickReply}
          handleDelete={handleDelete}
          handleEditClick={handleEditClick}
        />
        {repliesJSX}
      </>
    );
  });

  return (
    <div className={classes.Container}>
      {jsxComment}
      <CommentManager
        isReplyButtonClicked={isReplyButtonClicked}
        replyingTo={replyingTo}
        commentId={commentId}
        rootCommentId={rootCommentId}
        editingData={editingData}
        currentUser={props.currentUser}
        rebootReplyButtonState={rebootReplyButtonState}
        handleUserComment={handleUserComment}
        handleUserReply={handleUserReply}
        handleEditComment={handleEditComment}
      />
    </div>
  );
}
