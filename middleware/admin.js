const admin = (req, res , next) =>  {
    // console.log(req.user)

    if(!req.user.isAdmin){
        return res.status(403).json({
            success:false,
            message: "Admin access required"
        })
    }

    next();

}

module.exports = admin;