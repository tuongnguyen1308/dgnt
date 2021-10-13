$(document).ready(() => {
  const redirectUrl = "/product-management";
  const PrdreqlModal = document.getElementById("modal-prdreq");
  //#region func
  let generatePrdreqItem = (pId, pName, pQuantity) => {
    let valided = true;
    let list_prd_taken = [];
    $("#pr-list input[name=pId]").each(function () {
      let prd_selected_id = $(this).val();
      list_prd_taken[prd_selected_id] = 1;
      if (list_prd_taken[pId] != 1) {
        $("#pr-error").addClass("d-none").text("");
      } else {
        $("#pr-error")
          .removeClass("d-none")
          .text("Sản phẩm đã được thêm trước đó");
        valided = false;
      }
    });
    if (valided) {
      let prItemTemplate = document.querySelector("#pr-item-template");
      let prItem = prItemTemplate.content.cloneNode(true);
      let pIdInput = prItem.querySelector("[name=pId]");
      pIdInput.value = pId;
      let pNameSpan = prItem.querySelector("[rel=product-name]");
      pNameSpan.innerText = pName;
      if (pQuantity) {
        let pQuantitySelector = prItem.querySelector("[name=pQuantity]");
        pQuantitySelector.value = pQuantity;
      }
      $("#pr-list").append(prItem);
      feather.replace({ "aria-hidden": "true" });
    }
  };

  let preparePrdreqModal = ($btn = null) => {
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    $("#modal-prdreq input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      PrdreqlModal.appendChild(inputID);
    }

    // edit url & modal title
    PrdreqlModal.action = $btn ? "/prdreq/update" : "/prdreq/add";
    $("#modal-prdreq-title").text(
      $btn ? "Sửa yêu cầu nhập sản phẩm" : "Thêm yêu cầu nhập sản phẩm"
    );
    document.getElementById("prReason").value = $btn?.data("reason") || "";
    $("#pr-list tr").remove();
    if ($btn) {
      const detail = $btn.data("detail");
      detail.map((p) => {
        generatePrdreqItem(p.pId._id, p.pId.pName, p.pQuantity);
      });
    }
    let cDate = new Date();
    cDate.setUTCHours(cDate.getUTCHours() + 7);
    let curDate = $btn ? $btn.data("deadline") : cDate.toISOString();
    $("#prDeadlineAt").val(curDate.slice(0, 10));
    $("[name=pfind]").val("");
  };

  let prepareMtrcheckModal = (prDetail, id) => {
    $("#mcheck-list tr").remove();
    $("#mcheck-result").html("");
    let listUpdMtr = [];
    let enoughMtr = true;
    prDetail.map((detail) => {
      let p = detail.pId;
      let mcheckItemTemplate = document.querySelector("#mcheck-item-template");
      let mcItem = mcheckItemTemplate.content.cloneNode(true);
      let pNameTd = mcItem.querySelector("[rel=pName]");
      pNameTd.innerText = p.pName;
      pNameTd.rowSpan = p.mConsume.length;
      p.mConsume.map((m, i) => {
        let subItemTemplate = document.querySelector(
          "#sub-mcheck-item-template"
        );
        let smcItem = subItemTemplate.content.cloneNode(true);
        let mNameTd = smcItem.querySelector("[rel=mName]");
        mNameTd.innerText = m.mId.mName;
        let mQuantityTd = smcItem.querySelector("[rel=mQuantity]");
        mQuantityTd.innerText = m.mQuantity;
        let pQuantityTd = smcItem.querySelector("[rel=pQuantity]");
        pQuantityTd.innerText = detail.pQuantity;
        let mQuanNeedTd = smcItem.querySelector("[rel=mQuanNeed]");
        let mQuanNeed = detail.pQuantity * m.mQuantity;
        mQuanNeedTd.innerText = mQuanNeed;
        let mStockTd = smcItem.querySelector("[rel=mStock]");
        mStockTd.innerText = m.mId.mStock;
        let index = listUpdMtr.findIndex((mtr) => mtr._id == m.mId._id);
        let mleft = 0;

        if (index !== -1) {
          mleft = listUpdMtr[index].mStock - detail.pQuantity * m.mQuantity;
          mStockTd.innerText = `${listUpdMtr[index].mStock} (-${
            m.mId.mStock - listUpdMtr[index].mStock
          })`;
          listUpdMtr[index].mStock = mleft;
        } else {
          mleft = m.mId.mStock - detail.pQuantity * m.mQuantity;
          listUpdMtr.push({ _id: m.mId._id, mStock: mleft });
        }
        if (mleft < 0) {
          mStockTd.classList.add("text-danger");
          enoughMtr = false;
        }
        let row = mcItem.querySelector("[rel=row]");
        if (i !== 0) {
          let tr = document.createElement("tr");
          tr.appendChild(smcItem);
          mcItem.appendChild(tr);
        } else row.appendChild(smcItem);
      });
      $("#mcheck-list").append(mcItem);
    });
    if (enoughMtr) {
      let enoughTemp = document.querySelector("#enough-template");
      let enoughItem = enoughTemp.content.cloneNode(true);
      let aId = enoughItem.querySelector("a");
      aId.dataset.id = id;
      $("#mcheck-result").append(enoughItem);
    } else {
      let notEnoughTemp = document.querySelector("#not-enough-template");
      let notEnoughItem = notEnoughTemp.content.cloneNode(true);
      $("#mcheck-result").append(notEnoughItem);
    }
    feather.replace({ "aria-hidden": "true" });
  };
  //#endregion

  //#region validate

  $("#prDeadlineAt").on("change", function () {
    const title = "Hạn hoàn thành";
    let val = new Date($(this).val());
    let curDate = new Date();
    curDate.setHours(0, 0, 0, 0);
    console.log(val);
    console.log(curDate);
    let cases = [
      { con: val == "Invalid Date", mess: `${title} không hợp lệ` },
      { con: val.getTime() < curDate.getTime(), mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $("#prDeadlineAt").on("keyup", function () {
    const title = "Hạn hoàn thành";
    let val = new Date($(this).val());
    let curDate = new Date();
    curDate.setHours(0, 0, 0, 0);
    let cases = [
      { con: val == "Invalid Date", mess: `${title} không hợp lệ` },
      { con: val.getTime() < curDate.getTime(), mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $("#prReason").on("keyup", function () {
    const title = "Lý do";
    const maxVal = 255;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#modal-prdreq").on("submit", function (e) {
    if ($("#pr-list [name=pId]").length == 0) {
      e.preventDefault();
      e.stopPropagation();
      $("#pr-error")
        .removeClass("d-none")
        .text("Danh sách sản phẩm là bắt buộc");
    } else {
      $("#pr-error").addClass("d-none").text("");
    }
  });
  //#endregion

  //#region events
  // call modal
  $(".btn[role=add-prdreq]").on("click", function () {
    preparePrdreqModal();
  });
  // call modal mcheck
  $(".btn[role=view-mcheck]").on("click", function () {
    prepareMtrcheckModal($(this).data("prds"), $(this).data("id"));
  });

  // find-product
  $("[rel=find-product]").on("click", function () {
    const keyword = $("[name=pfind]").val();
    $.ajax({
      type: "POST",
      url: "/product/find",
      data: { keyword },
      success: function (res) {
        $("#listPrdreqItem").html("");
        res.map((p) => {
          let resultItemTemp = document.querySelector("#searchp-result-temp");
          let resItem = resultItemTemp.content.cloneNode(true);
          let iImg = resItem.querySelector("img");
          iImg.src = `img/products/` + p.pImgs.find((pi) => pi.piIsMain).piImg;
          let iId = resItem.querySelector("li");
          iId.dataset.id = p._id;
          let iName = resItem.querySelector("h5");
          iName.innerText = p.pName;
          let iPrice = resItem.querySelector("p");
          iPrice.innerText = (
            p.pPrice -
            (p.pPrice * p.pDiscount) / 100
          ).toLocaleString("vi", { style: "currency", currency: "VND" });
          $("#listPrdreqItem").append(resItem);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // add prd
  $(document).on("click", "[role=list-prdreq_add]", function () {
    generatePrdreqItem($(this).data("id"), $(this).find("h5").text());
  });
  // del prd
  $(document).on("click", "[role=list-prdreq_delete]", function () {
    $(this).parent().parent().remove();
  });
  // call modal
  $(".btn[role=edit-prdreq]").on("click", function () {
    preparePrdreqModal($(this));
  });
  // cancel prdreq
  $(document).on("click", "[role=update-state-prdreq]", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    const prState = $target.data("state");
    $.ajax({
      type: "PATCH",
      url: "/prdreq/" + id,
      data: { prState },
      success: function (res) {
        console.log(res);
        window.location.replace(redirectUrl);
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  //#endregion
});
