const UserModel = require('../model/auth.model');
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
 
  
  if(!token){
    return res.status(401).json({
      message: "Unauthorized Access ! Please Login First",
    });
  } 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        message: "Unouthorized Access ! User Not Found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });

  }

}


module.exports = authMiddleware