$(document).ready(() => {
  const MtrreqlModal = document.getElementById("modal-mtrreq");
  //#region func
  let generateMtrreqItem = (mId, mQuantity) => {
    let mrItemTemplate = document.querySelector("#mr-item-template");
    let mrItem = mrItemTemplate.content.cloneNode(true);
    if (mId) {
      let mIdSelector = mrItem.querySelector("[name=mId]");
      mIdSelector.value = mId;
    }
    if (mQuantity) {
      let mQuantitySelector = mrItem.querySelector("[name=mQuantity]");
      mQuantitySelector.value = mQuantity;
    }
    $("#mr-list").append(mrItem);
    feather.replace({ "aria-hidden": "true" });
    let cases = [{ con: true, mess: `Tên NVL là bắt buộc` }];
    checkValidate(cases, $("#mr-list tr:last-child select").get(0), false);
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
        generateMtrreqItem(m.mId._id, m.mQuantity);
      });
    }
    $("select").trigger("change");
  };

  let checkSelectValue = () => {
    $("#mr-list [name=mId]").each(function () {
      let mtr_selected_id = $(this).find("option:selected").val();
      let cases = [{ con: mtr_selected_id == -1, mess: `Tên NVL là bắt buộc` }];
      checkValidate(cases, this);
    });
  };
  //#endregion

  //#region validate
  $(document).on("change", "[role=list-mtrreq_select]", function (e) {
    let list_mtr_taken = [];
    $("#mr-list [role=list-mtrreq_select]").each(function () {
      let mtr_selected_id = $(this).find("option:selected").val();
      if (mtr_selected_id != -1) {
        if (list_mtr_taken[mtr_selected_id] != 1) {
          list_mtr_taken[mtr_selected_id] = 1;
          let cases = [{ con: false, mess: `` }];
          checkValidate(cases, this);
        } else {
          let cases = [{ con: true, mess: `NVL này đã được thêm trước đó` }];
          checkValidate(cases, this);
        }
      }
    });
  });
  $("#modal-mtrreq").on("submit", function (e) {
    if ($("#mr-list [name=mId]").length == 0) {
      console.log("invalid");
      e.preventDefault();
      e.stopPropagation();
      $("#mr-error").removeClass("d-none").text("Danh sách NVL là bắt buộc");
    } else {
      console.log("valid");
      $("#mr-error").addClass("d-none").text("");
      checkSelectValue();
    }
  });
  //#endregion

  //#region events
  // call modal
  $(".btn[role=add-mtrreq]").on("click", function () {
    prepareMtrreqModal();
  });
  // add mtr
  $("[role=list-mtrreq_add]").on("click", function () {
    generateMtrreqItem();
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
