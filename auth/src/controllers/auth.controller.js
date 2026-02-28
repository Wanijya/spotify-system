import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";

export async function register(req, res) {
  const {
    fullName: { firstName, lastName },
    email,
    password,
  } = req.body;
  const isUserAlreadyExists = await userModel.findOne({ email });

  if (isUserAlreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    email,
    password: hash,
    fullName: {
      firstName,
      lastName,
    },
  });
  const token = jwt.sign({ id: user._id, role: user.role }, _config.JWT_SECRET, {
    expiresIn: "2d",
  });

  await publishToQueue("user_created", {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  res.cookie("token", token);
  return res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

export async function googleAuthCallback(req, res) {
  const user = req.user;
  console.log(user);
  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email: user.emails[0].value }, { googleId: user.id }],
  });

  if (isUserAlreadyExists) {
    const token = jwt.sign(
      {
        id: isUserAlreadyExists._id,
        role: isUserAlreadyExists.role,
      },
      _config.JWT_SECRET,
      {
        expiresIn: "2d",
      },
    );
    res.cookie("token", token);
    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: isUserAlreadyExists._id,
        email: isUserAlreadyExists.email,
        fullName: isUserAlreadyExists.fullName,
      },
    });
  }

  const newUser = await userModel.create({
    email: user.emails[0].value,
    googleId: user.id,
    fullName: {
      firstName: user.name.givenName,
      lastName: user.name.familyName,
    },
  });
  const token = jwt.sign(
    {
      id: newUser._id,
      role: newUser.role,
    },
    _config.JWT_SECRET,
    {
      expiresIn: "2d",
    },
  );
  res.cookie("token", token);
  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    },
  });
}
