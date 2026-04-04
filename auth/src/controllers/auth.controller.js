import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import _config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";
import crypto from "crypto";

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
    {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    },
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
    console.error(
      "Failed to publish to RabbitMQ (email won't send):",
      err.message,
    );
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

    const frontendUrl = _config.FRONTEND_URL || "http://localhost:5173";
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
    {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
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

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  const successResponse = {
    message:
      "If an account exists with this email, a password reset link has been sent.",
  };

  if (!user) {
    return res.status(200).json(successResponse);
  }

  // 1. Generate a random plain token (this token goes to the user's email)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash the token before saving it to the database for security
  const hashedToken = await bcrypt.hash(resetToken, 10);

  // 3. Set token expiry (e.g., 1 hours from now)
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  // 4. Save to user model
  user.resetToken = hashedToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  //Publish to RabbitMQ
  try {
    await publishToQueue("password_reset", {
      email: user.email,
      fullName: user.fullName.firstName,
      resetToken,
      resetLink: `${_config.FRONTEND_URL}/reset-password/${resetToken}`,
    });
  } catch (err) {
    console.error(
      "Failed to publish to RabbitMQ (email won't send):",
      err.message,
    );
  }

  return res.status(200).json(successResponse);
}

export async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: "Token and new password are required",
    });
  }

  // Find user with valid reset token (NOT inside the if block!)
  const user = await userModel.findOne({
    resetToken: { $exists: true, $ne: null },
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }

  // Compare provided token with hashed token in DB
  const isValidToken = await bcrypt.compare(token, user.resetToken);

  if (!isValidToken) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }

  // Hash the new password
  const hashPassword = await bcrypt.hash(password, 10);

  // Update user's password
  user.password = hashPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  return res.status(200).json({
    message: "Password reset successfully",
  });
}
