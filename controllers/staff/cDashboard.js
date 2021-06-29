module.exports.index = async (req, res) => {
  const title = "Trang chủ";
  const curPage = "dashboard";
  const messages = req.session?.messages || null;
  req.session.messages = null;
  res.render(`./staff/${curPage}`, {
    title,
    curPage,
    messages,
  });
};
