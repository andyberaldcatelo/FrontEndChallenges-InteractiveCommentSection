import React, { useState, useEffect } from "react";
import User from "../User/User";
import classes from "./Comment.module.css";
import { MdDelete, MdEdit, MdReply } from "react-icons/md";

export default function Comment(props) {
  /* Styling according to condition */
  let commentContainerStyling = [classes.CommentContainer];
  if (props.isReply) commentContainerStyling = [classes.ReplyContainer];
  let isCommentWriter =
    props.currentUser.username === props.comment.user.username;

  let content = null;

  const [score, setScore] = useState(props.comment.score);
  const [incrBtnDisabled, setIncrBtnDisabled] = useState(false);
  const [decremBtnDisabled, setDecremBtnDisabled] = useState(false);

  /* Functions */
  const handleIncrementScore = function () {
    setScore((score) => score + 1);
  };

  const handleDecrementScore = function () {
    if (score >= 1) setScore((score) => score - 1);
  };

  /**
   * Side-Effects
   */
  useEffect(() => {
    switch (score - props.comment.score) {
      case 0:
        setIncrBtnDisabled((prevState) => false);
        setDecremBtnDisabled((prevState) => false);
        break;
      case 1:
        setIncrBtnDisabled((prevState) => true);
        setDecremBtnDisabled((prevState) => false);
        break;
      case -1:
        setIncrBtnDisabled((prevState) => false);
        setDecremBtnDisabled((prevState) => true);
        break;
      default:
        break;
    }
  }, [score, props.comment.score]);

  /**
   *  On mounting component
   */
  //  Crafting comment according to props
  if (props.comment.quote) {
    content = (
      <>
        <p className={classes.Paragraph}>
          <strong className={classes.Username}>{props.comment.quote}</strong>
          {props.comment.content}
        </p>
      </>
    );
  } else {
    content = <p className={classes.Paragraph}>{props.comment.content}</p>;
  }

  return (
    <div className={commentContainerStyling}>
      <div className={classes.Row1}>
        <div className={classes.UserContainer}>
          <User user={props.comment.user} />
        </div>
        <div className={classes.You}>you</div>
        <div className={classes.CreatedAt}>{props.comment.createdAt}</div>
      </div>

      <div className={classes.Row2}>{content}</div>

      <div className={classes.Row3}>
        <div className={classes.ApprouvalCounter}>
          <button
            className={classes.CounterButtonPlus}
            onClick={handleIncrementScore}
            disabled={incrBtnDisabled}
          >
            +
          </button>
          <span>{score}</span>
          <button
            className={classes.CounterButtonMinus}
            onClick={handleDecrementScore}
            disabled={decremBtnDisabled || score < 1}
          >
            -
          </button>
        </div>

        <div className={classes.EditDeleteContainer}>
          {isCommentWriter ? (
            <>
              <div
                className={classes.EditButton}
                onClick={() => {
                  props.handleEditClick(props);
                }}
              >
                <MdEdit className={classes.Icon} />
                <span>Edit</span>
              </div>
              <div
                className={classes.DeleteButton}
                onClick={() =>
                  props.handleDelete(props.id, props.rootCommentId)
                }
              >
                <MdDelete className={classes.Icon} />
                <span>Delete</span>
              </div>
            </>
          ) : (
            <>
              <div
                className={classes.ReplyButton}
                onClick={() => {
                  props.handleClickReply(
                    props.comment.user.username,
                    props.id,
                    props.isReply,
                    props.rootCommentId
                  );
                }}
              >
                <MdReply className={classes.Icon} />
                <span>Reply</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
