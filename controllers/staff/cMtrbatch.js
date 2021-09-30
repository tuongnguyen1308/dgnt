const MtrBatch = require("../../models/mMtrbatch");
const Material = require("../../models/mMaterial");
const pI = { title: "Quản lý Nguyên vật liệu", url: "material" };
const rootRoute = `/${pI.url}`;

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
  res.redirect("/material");
};

module.exports.add = async (req, res) => {
  const sess = req.session.user;
  try {
    let mbDetail = [];
    let mIds = req.body.mId;
    let mQuantitys = req.body.mQuantity;
    let mPrices = req.body.mPrice;

    if (typeof mIds === "string") {
      mIds = [mIds];
      mQuantitys = [mQuantitys];
      mPrices = [mPrices];
    }
    mIds.map((mId, index) => {
      mbDetail.push({
        mId,
        mQuantity: mQuantitys[index],
        mPrice: mPrices[index],
      });
    });
    let newMtrbatch = new MtrBatch({
      mbSupplier: req.body.mbSupplier,
      mbBatchAt: req.body.mbBatchAt,
      mbTotal: req.body.mbTotal,
      mrId: req.body.mrId,
      mbDetail,
      sId: sess.sId,
    });
    await newMtrbatch.save();
    // update mtr_quantity
    mbDetail.map(async (mtr) => {
      let stock = await Material.findOne({ _id: mtr.mId });
      let updMaterial = {
        mStock: parseInt(stock.mStock) + parseInt(mtr.mQuantity),
      };
      await Material.findByIdAndUpdate(mtr.mId, { $set: updMaterial });
    });
    redirectFunc(true, "Thêm đợt nhập thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Thêm đợt nhập thất bại!", rootRoute, req, res);
  }
};

module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let mbDetail = [];
  let mIds = req.body.mId;
  let mQuantitys = req.body.mQuantity;
  let mPrices = req.body.mPrice;
  if (typeof mIds === "string") {
    mIds = [mIds];
    mQuantitys = [mQuantitys];
    mPrices = [mPrices];
  }
  mIds.map((mId, index) => {
    mbDetail.push({
      mId,
      mQuantity: mQuantitys[index],
      mPrice: mPrices[index],
    });
  });
  let updMtrbatch = {
    mbSupplier: req.body.mbSupplier,
    mbBatchAt: req.body.mbBatchAt,
    mbTotal: req.body.mbTotal,
    mbDetail,
    sId: sess.sId,
  };
  try {
    let oldBatch = await MtrBatch.findOne({ _id: req.body.id });
    // update mtr_quantity
    oldBatch.mbDetail.map(async (mtr) => {
      let stock = await Material.findOne({ _id: mtr.mId });
      let newMtrBatchItem = mbDetail.find((m) => m.mId == mtr.mId);
      let updMaterial = {
        mStock:
          parseInt(stock.mStock) -
          parseInt(mtr.mQuantity) +
          parseInt(newMtrBatchItem?.mQuantity || 0),
      };
      await Material.findByIdAndUpdate(mtr.mId, { $set: updMaterial });
    });
    await MtrBatch.findByIdAndUpdate(req.body.id, { $set: updMtrbatch });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
  return;
};

module.exports.delete = async (req, res) => {
  let oldBatch = await MtrBatch.findOne({ _id: req.params.id });
  // update mtr_quantity
  oldBatch.mbDetail.map(async (mtr) => {
    let stock = await Material.findOne({ _id: mtr.mId });
    let updMaterial = {
      mStock: parseInt(stock.mStock) - parseInt(mtr.mQuantity),
    };
    await Material.findByIdAndUpdate(mtr.mId, { $set: updMaterial });
  });
  await MtrBatch.findByIdAndDelete(req.params.id, (err) => {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Xóa đợt nhập thành công!" : "Xóa đợt nhập thất bại!",
    };
    res.json(!err);
  });
};
