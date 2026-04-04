const jwt = require("jsonwebtoken");

function authMiddleware(role=['user']){

return  function auth(req,res,next){
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if(!token){
        return res.status(401).json({message : "Unauthorized"})
    }


    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);

        if(!role.includes(decoded.role)){
            return res.status(403).json({message : "Forbidden"})
        }
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({message : "Unauthorized"})
    }
}


}


module.exports = authMiddleware;
