const Account = require("../../models/mAccount");
const bcrypt = require("bcrypt");
module.exports.index = async (req, res) => {
  const pI = { title: "Giới thiệu", url: "shop-about" };
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
  });
};
