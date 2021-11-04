const Review = require("../../models/mReview");
const pI = { title: "Quản lý đánh giá", url: "review" };
const rootRoute = `/${pI.url}`;
const imgViewSize = 300;
const imgPreviewSize = 465;
const PAGE_SIZE = 10;

let redirectFunc = (state, text, dir, req, res) => {
  req.session.messages = {
    icon: state ? "check-circle" : "alert-circle",
    color: state ? "success" : "danger",
    title: state ? "Thành công" : "Thất bại",
    text,
  };
  res.redirect(dir);
  return;
};

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  //#region pagination
  let pageNum = Math.max(req.query.pnum || 1, 1);
  let skipPage = (pageNum - 1) * PAGE_SIZE;
  let total = await Review.countDocuments();
  let totalR = Math.ceil(total / PAGE_SIZE);
  //#endregion

  let reviews = await Review.find({})
    .sort({ rAt: "desc" })
    .skip(skipPage)
    .limit(PAGE_SIZE)
    .populate({
      path: "cId",
      select: "cName",
    })
    .populate("pId");
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    reviews,
    imgViewSize,
    imgPreviewSize,
    sess,
    pageNum,
    total,
    totalR,
    pageSize: PAGE_SIZE,
  });
};

module.exports.patch = async (req, res) => {
  let hideR = {
    rState: req.body.rState,
  };
  let title = hideR.rState == "true" ? "Hiện đánh giá" : "Ẩn đánh giá";
  // let title = req.body.rState ? "Hiện đánh giá" : "Ẩn đánh giá";
  await Review.findByIdAndUpdate(req.params.id, { $set: hideR }, (err) => {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? `${title} thành công!` : `${title} thất bại!`,
    };
    res.json(!err);
  });
};
