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
    role = "user",
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
    role,
  });
  const token = jwt.sign(
    { id: user._id, role: user.role, fullName: user.fullName, email: user.email },
    _config.JWT_SECRET,
    {
      expiresIn: "2d",
    },
  );

  try {
    await publishToQueue("user_created", {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (err) {
    console.error("Failed to publish to RabbitMQ (email won't send):", err.message);
  }

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  };

  res.cookie("token", token, cookieOptions);
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
        fullName: isUserAlreadyExists.fullName,
        email: isUserAlreadyExists.email,
      },
      _config.JWT_SECRET,
      {
        expiresIn: "2d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    if (isUserAlreadyExists.role === "artist") {
      const frontendUrl = _config.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/artist/dashboard`);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}`);
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
      fullName: newUser.fullName,
      email: newUser.email,
    },
    _config.JWT_SECRET,
    {
      expiresIn: "2d",
    },
  );
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}`);
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, fullName: user.fullName, email: user.email },
    _config.JWT_SECRET,
    {
      expiresIn: "2d",
    },
  );
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

export async function getProfile(req, res) {
  if (req.user) {
    return res.status(200).json({ user: req.user });
  }
  return res.status(401).json({ message: "Not authenticated" });
}

export async function logout(req, res) {
  res.clearCookie("token");
  return res.status(200).json({ message: "User logged out successfully" });
}
