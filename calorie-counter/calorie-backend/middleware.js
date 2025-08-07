import jwt from 'jsonwebtoken';
const JWT_SECRET='27d6c4a782102fdb038cd7bf0bbaa4c11bc3a234fe9e05d8b82d185327ba73829107f83fc49c9ebfffe5a22d8097f28c1b010b2d8e234511a74c5a01b8b12b7e';
export const authenticationToken=(req,res,next)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader?.split(' ')[1];
    if(!token) return res.status(401).json({message:'Token required'});
    jwt.verify(token,JWT_SECRET,(err,user)=>
    {
        if(err) return res.status(403).json({message:'Invalid token'}); 
        req.user=user;
        next();
        

    });
};
