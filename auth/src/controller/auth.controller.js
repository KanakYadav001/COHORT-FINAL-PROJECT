const UserModel = require("../model/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function Register(req, res) {
  try {
    const {
      username,
      email,
      password,
      fullName: { firstName, lastName },
    } = req.body;

    //if user enter his email in upper case
    const lowerEmail = email.toLowerCase();

    const isUserExits = await UserModel.findOne({
      $or: [{ email: lowerEmail }, { username }],
    });

    if (isUserExits) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      username: username,
      email: lowerEmail,
      password: hashPassword,
      fullName: { firstName, lastName },
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  }
}

async function Login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  // Convert email to lowercase to match with registered email
  const lowerEmail = email.toLowerCase();

  const isUserExits = await UserModel.findOne({
    email: lowerEmail,
  });

  if (!isUserExits) {
    return res.status(404).json({
      message: "User Not found ! Please Register First",
    });
  }

  const isPasswaordValid = await bcrypt.compare(password, isUserExits.password);

  if (!isPasswaordValid) {
    return res.status(401).json({
      message: "Invalid Password",
    });
  }

  const token = jwt.sign(
    {
      id: isUserExits.id,
      username: isUserExits.username,
      email: isUserExits.email,
      role: isUserExits.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 24 * 60 * 1000,
  });

  res.status(200).json({
    message: "User Login Sucessfully",
  });
}

module.exports = {
  Register,
  Login,
};
