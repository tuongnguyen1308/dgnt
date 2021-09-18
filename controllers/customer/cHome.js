const Account = require("../../models/mAccount");
module.exports.index = async (req, res) => {
  const pI = { title: "Trang chủ", url: "home" };
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
  });
};
