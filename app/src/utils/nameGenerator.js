import usernames from "./usernames";

const generateUsername = () => {
  return usernames[Math.floor(Math.random() * usernames.length)];
};

export default generateUsername;
