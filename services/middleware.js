'use strict'

let logger = (req,res,next) => {
  console.log(JSON.stringify(req.body,null,2));
  next();
}
module.exports = {
  log:logger,
}
