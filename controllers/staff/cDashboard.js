module.exports.index = async (req, res) => {
  const pI = { title: "Trang chủ", url: "dashboard" };
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    sess,
  });
};
