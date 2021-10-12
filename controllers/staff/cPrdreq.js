const Prdreq = require("../../models/mPrdreq");
const Product = require("../../models/mProduct");
const Material = require("../../models/mMaterial");
const pI = { title: "Quản lý sản phẩm", url: "product" };
const rootRoute = `/${pI.url}-management`;

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
  res.redirect(rootRoute);
};

module.exports.add = async (req, res) => {
  const sess = req.session.user;
  try {
    let prDetail = [];
    let pIds = req.body.pId;
    let pQuantitys = req.body.pQuantity;
    if (typeof pIds === "string") {
      pIds = [pIds];
      pQuantitys = [pQuantitys];
    }
    pIds.map((pId, index) => {
      prDetail.push({ pId, pQuantity: pQuantitys[index] });
    });
    let newPrdreq = new Prdreq({
      prReason: req.body.prReason,
      prDeadlineAt: req.body.prDeadlineAt,
      prDetail: prDetail,
      scId: sess.sId,
      suId: sess.sId,
      prState: 0,
    });
    await newPrdreq.save();
    redirectFunc(true, "Thêm yêu cầu thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Thêm yêu cầu thất bại!", rootRoute, req, res);
  }
};

module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let prDetail = [];
  let pIds = req.body.pId;
  let pQuantitys = req.body.pQuantity;
  if (typeof pIds === "string") {
    pIds = [pIds];
    pQuantitys = [pQuantitys];
  }
  pIds.map((pId, index) => {
    prDetail.push({ pId, pQuantity: pQuantitys[index] });
  });
  let updPrdreq = {
    prReason: req.body.prReason,
    prDeadlineAt: req.body.prDeadlineAt,
    prDetail,
    prState: 0,
    suId: sess.sId,
  };
  try {
    await Prdreq.findByIdAndUpdate(req.body.id, { $set: updPrdreq });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
  return;
};

module.exports.patch = async (req, res) => {
  const sess = req.session.user;
  let updPrdreq = {
    prState: req.body.prState,
    suId: sess.sId,
  };
  if (updPrdreq.prState == 1) {
    let prdreq = await Prdreq.findOne({ _id: req.params.id }).populate({
      path: "prDetail.pId",
      populate: "mConsume.mId",
    });
    // update mtr_quantity
    let listUpdMtr = [];
    let listUpdPrd = [];
    let isEnoughMtr = true;
    let errtext = "";
    prdreq.prDetail.map((p) => {
      let stock = p.pId;
      stock.mConsume.map((m) => {
        // kiểm tra mtr đã được dùng hay chưa
        let index = listUpdMtr.findIndex((mtr) => mtr._id == m.mId._id);
        if (index != -1) {
          // lấy số lượng còn lại của lần truốc đó để trừ
          let mleft = listUpdMtr[index].mStock - p.pQuantity * m.mQuantity;
          if (mleft < 0) {
            isEnoughMtr = false;
          } else listUpdMtr[index].mStock = mleft;
        } else {
          // lấy số lượng gốc trong kho để trừ
          let mleft = m.mId.mStock - p.pQuantity * m.mQuantity;
          if (mleft < 0) {
            isEnoughMtr = false;
          } else {
            listUpdMtr.push({ _id: m.mId._id, mStock: mleft });
          }
        }
      });
      if (isEnoughMtr) {
        listUpdPrd.push({
          _id: p.pId._id,
          pStock: parseInt(stock.pStock) + parseInt(p.pQuantity),
        });
      }
    });
    if (isEnoughMtr) {
      try {
        listUpdMtr.map(async (m) => {
          await Material.findByIdAndUpdate(m._id, { $set: m });
        });

        listUpdPrd.map(async (p) => {
          await Product.findByIdAndUpdate(p._id, { $set: p });
        });
      } catch (error) {
        console.log(error);
        req.session.messages = {
          icon: "alert-circle",
          color: "danger",
          title: "Thất bại",
          text: error,
        };
        res.json(false);
      }
    } else {
      req.session.messages = {
        icon: "alert-circle",
        color: "danger",
        title: "Thất bại",
        text: errtext,
      };
      res.json(false);
      return;
    }
  }
  await Prdreq.findByIdAndUpdate(req.params.id, { $set: updPrdreq }, (err) => {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Cập nhật thành công!" : "Cập nhật thất bại!",
    };
    res.json(!err);
  });
};
