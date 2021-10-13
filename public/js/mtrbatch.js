$(document).ready(() => {
  const MtrbatchlModal = document.getElementById("modal-mtrbatch");
  //#region func
  let generateMtrbatchItem = (m, mQuantity, mPrice) => {
    let mbItemTemplate = document.querySelector("#mb-item-template");
    let mbItem = mbItemTemplate.content.cloneNode(true);
    if (m) {
      let input_mId = mbItem.querySelector("[name=mId]");
      input_mId.value = m._id;
      let span_mName = mbItem.querySelector("[rel=mName]");
      span_mName.innerText = m.mName;
    }
    if (mQuantity) {
      let input_mQuantity = mbItem.querySelector("[name=mQuantity]");
      input_mQuantity.value = mQuantity;
    }
    if (mPrice) {
      let input_mPrice = mbItem.querySelector("[name=mPrice]");
      input_mPrice.value = mPrice;
    }
    $("#mb-list").append(mbItem);
    feather.replace({ "aria-hidden": "true" });
  };

  let prepareMtrbatchModal = ($btn = null) => {
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove old data
    $("#modal-mtrbatch input#id, #mb-list tr").remove();
    $("[name=mbTotal]").val("");
    $("[rel=mbTotal]").text("");
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      MtrbatchlModal.appendChild(inputID);
    }

    // edit url & modal title
    MtrbatchlModal.action = $btn ? "/mtrbatch/update" : "/mtrbatch/add";
    $("#modal-mtrbatch-title").text(
      $btn ? "Sửa đợt nhập NVL" : "Thêm đợt nhập NVL"
    );
    let curDate = $btn ? $btn.data("batchat") : new Date().toISOString();
    $("#mbBatchAt").val(curDate.slice(0, 10));
    $("#mbSupplier").val($btn ? $btn.data("supplier") : "");
    $("#mrId")
      .val($btn ? $btn.data("mrid") : "-1")
      .prop("disabled", $btn ? true : false);
    if ($btn) {
      const detail = $btn.data("detail");
      detail.map((m) => {
        generateMtrbatchItem(m.mId, m.mQuantity, m.mPrice);
      });
      calculateMtrBatchTotal();
    }
  };
  //#endregion

  //#region validate
  $("#mbBatchAt").on("keyup", function () {
    const title = "Ngày nhập";
    let val = new Date($(this).val());
    let cases = [{ con: val == "Invalid Date", mess: `${title} không hợp lệ` }];
    checkValidate(cases, this);
  });

  $(document).on("keyup", "[name=mPrice]", function () {
    const title = "Đơn giá";
    let val = $(this).val();
    let cases = [
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val % 1 != 0, mess: `${title} không hợp lệ` },
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val <= 0, mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $("#mbSupplier").on("keyup", function () {
    const title = "Nhà cung cấp";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length >= maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });
  $("#modal-mtrbatch").on("submit", function (e) {
    let cases = [
      {
        con: $("#mrId").find("option:selected").val() == -1,
        mess: `Yêu cầu nhập NVL là bắt buộc`,
      },
    ];
    let sltMrId = document.getElementById("mrId");
    checkValidate(cases, sltMrId);
  });
  $("#mrId").on("change", function (e) {
    const con = $(this).find("option:selected").val() == -1;
    let cases = [{ con, mess: `Yêu cầu nhập NVL là bắt buộc` }];
    checkValidate(cases, this, false);
    $("#mb-list tr").remove();
    if (!con) {
      let mrlistdata = $(this).find("option:selected").data("detail");
      mrlistdata.map((m) => {
        generateMtrbatchItem(m.mId, m.mQuantity, m.mPrice);
      });
    }
  });

  const calculateMtotal = ($tr) => {
    const price = $tr.find("[name=mPrice]").val();
    const quantity = $tr.find("[name=mQuantity]").val();
    if (!isNaN(price)) {
      let total = (price * quantity).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      });
      $tr.find("[rel=mTotal]").text(total);
      return price * quantity;
    }
    return 0;
  };

  const calculateMtrBatchTotal = () => {
    let mbTotal = 0;
    $("#mb-list tr").each(function (index) {
      mbTotal += calculateMtotal($(this));
    });
    $("[rel=mbTotal]").text(
      mbTotal.toLocaleString("vi", { style: "currency", currency: "VND" })
    );
    $("input[name=mbTotal]").val(mbTotal);
  };

  $(document).on("keyup", "[name=mPrice], [name=mQuantity]", function (e) {
    calculateMtrBatchTotal();
  });
  //#endregion

  //#region events
  // call modal
  $(".btn[role=add-mtrbatch]").on("click", function () {
    prepareMtrbatchModal();
  });
  // del mtr
  $(document).on("click", "[role=list-material_delete]", function () {
    $(this).parent().parent().remove();
    calculateMtrBatchTotal();
  });
  // call modal
  $(".btn[role=edit-mtrbatch]").on("click", function () {
    prepareMtrbatchModal($(this));
  });
  // cancel mtrbatch
  $("[role=confirm-delete-mtrbatch]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/mtrbatch/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/material");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  //#endregion
});
