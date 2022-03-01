import React from "react";
import classes from "./User.module.css";

export default function User(props) {
  let user = props.user;
  let jsx = (
    <>
      <div className={classes.AvatarContainer}>
        <img
          src={user.image.webp}
          alt="UserAvatar"
          className={classes.UserAvatar}
        />
      </div>
      <div className={classes.UsernameContainer}>
        <span className={classes.Username}>{user.username}</span>
      </div>
    </>
  );
  if (props.userVersion === "avatar")
    jsx = (
      <img
        className={classes.UserAvatar}
        src={user.image.webp}
        alt="UserAvatar"
      />
    );
  if (props.userVersion === "username")
    jsx = (
      <div className={classes.UsernameContainer}>
        <span className={classes.Username}>{user.username}</span>
      </div>
    );

  return <div className={classes.UserContainer}>{jsx}</div>;
}
