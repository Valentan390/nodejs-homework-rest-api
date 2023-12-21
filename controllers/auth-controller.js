import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import jimp from "jimp";

import User from "../models/users.js";

import { HttpError } from "../helpers/HttpError.js";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";

const postersPath = path.resolve("public", "avatars");

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email, { s: "100", r: "x", d: "retro" }, true);
  console.log(avatarURL);
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already used");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });
  res.status(201).json({
    username: newUser.username,
    email: newUser.email,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { username, email } = req.user;
  res.json({ username, email });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Signout success",
  });
};

const updateUserAvatars = async (req, res) => {
  const { _id } = req.user;

  const { path: oldPath, filename } = req.file;

  const avatarImage = await jimp.read(oldPath);

  await avatarImage.resize(250, 250).write(path.join(postersPath, filename));
  await fs.unlink(oldPath);

  const avatar = path.join("avatars", filename);

  const updatedUserAvatar = await User.findByIdAndUpdate(_id, {
    avatarURL: avatar,
  });

  res.json({
    username: updatedUserAvatar.username,
    avatarURL: updatedUserAvatar.avatarURL,
  });
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateUserAvatars: ctrlWrapper(updateUserAvatars),
};
