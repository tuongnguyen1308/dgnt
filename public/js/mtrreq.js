$(document).ready(() => {
  const MtrreqlModal = document.getElementById("modal-mtrreq");
  //#region func
  let generateMtrreqItem = (mId, mName, mQuantity) => {
    let valided = true;
    let list_mtr_taken = [];
    $("#mr-list input[name=mId]").each(function () {
      let mtr_selected_id = $(this).val();
      list_mtr_taken[mtr_selected_id] = 1;
      if (list_mtr_taken[mId] != 1) {
        $("#mr-error").addClass("d-none").text("");
      } else {
        $("#mr-error").removeClass("d-none").text("NVL đã được thêm trước đó");
        valided = false;
      }
    });
    if (valided) {
      let mtrItemTemplate = document.querySelector("#mr-item-template");
      let mrItem = mtrItemTemplate.content.cloneNode(true);
      let mIdInput = mrItem.querySelector("[name=mId]");
      mIdInput.value = mId;
      let mNameSpan = mrItem.querySelector("[rel=material-name]");
      mNameSpan.innerText = mName;
      if (mQuantity) {
        let mQuantitySelector = mrItem.querySelector("[name=mQuantity]");
        mQuantitySelector.value = mQuantity;
      }
      $("#mr-list").append(mrItem);
      feather.replace({ "aria-hidden": "true" });
    }
  };

  let prepareMtrreqModal = ($btn = null) => {
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    $("#modal-mtrreq input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      MtrreqlModal.appendChild(inputID);
    }

    // edit url & modal title
    MtrreqlModal.action = $btn ? "/mtrreq/update" : "/mtrreq/add";
    $("#modal-mtrreq-title").text(
      $btn ? "Sửa yêu cầu nhập NVL" : "Thêm yêu cầu nhập NVL"
    );
    document.getElementById("mrReason").value = $btn?.data("reason") || "";
    $("#mr-list tr").remove();
    if ($btn) {
      const detail = $btn.data("detail");
      detail.map((m) => {
        generateMtrreqItem(m.mId._id, m.mId.mName, m.mQuantity);
      });
    }
    $("[name=mfind]").val("");
  };
  //#endregion

  //#region validate
  $("#mrReason").on("keyup", function () {
    const title = "Lý do";
    const maxVal = 255;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length >= maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $(document).on("keyup", "[name=mQuantity]", function () {
    const title = "Số lượng";
    let val = $(this).val();
    let cases = [
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val % 1 != 0, mess: `${title} không hợp lệ` },
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val <= 0, mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $("#modal-mtrreq").on("submit", function (e) {
    if ($("#mr-list [name=mId]").length == 0) {
      e.preventDefault();
      e.stopPropagation();
      $("#mr-error").removeClass("d-none").text("Danh sách NVL là bắt buộc");
    } else {
      $("#mr-error").addClass("d-none").text("");
    }
  });
  //#endregion

  //#region events
  // call modal
  $(".btn[role=add-mtrreq]").on("click", function () {
    prepareMtrreqModal();
  });
  // find material
  $("[rel=find-material]").on("click", function () {
    const keyword = $("[name=mfind]").val();
    $.ajax({
      type: "POST",
      url: "/material/find",
      data: { keyword },
      success: function (res) {
        $("#listMtrreqItem").html("");
        res.map((m) => {
          let resultItemTemp = document.querySelector("#search-result-temp");
          let resItem = resultItemTemp.content.cloneNode(true);
          let iImg = resItem.querySelector("img");
          iImg.src = `img/materials/` + m.mImg;
          let iId = resItem.querySelector("li");
          iId.dataset.id = m._id;
          let iName = resItem.querySelector("h5");
          iName.innerText = m.mName;
          $("#listMtrreqItem").append(resItem);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  // add mtr
  $(document).on("click", "[role=list-mtrreq_add]", function () {
    generateMtrreqItem($(this).data("id"), $(this).find("h5").text());
  });
  // del mtr
  $(document).on("click", "[role=list-mtrreq_delete]", function () {
    $(this).parent().parent().remove();
  });
  // call modal
  $(".btn[role=edit-mtrreq]").on("click", function () {
    prepareMtrreqModal($(this));
  });
  // cancel mtrreq
  $("[role=update-state-mtrreq]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    const mrState = $target.data("state");
    $.ajax({
      type: "PATCH",
      url: "/mtrreq/" + id,
      data: { mrState },
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
