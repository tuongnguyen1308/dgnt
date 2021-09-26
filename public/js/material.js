$(document).ready(() => {
  //#region modal
  const MaterialModal = document.getElementById("modal-material");
  const MtrreqlModal = document.getElementById("modal-mtrreq");
  //#region func
  let removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#mimg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };
  let changeImgWhenModalOpen = (con, src) => {
    if (con) {
      $("#img-preview").attr("src", src).removeClass("d-none");
      $("#mimg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    } else removeImg();
  };
  let prepareMaterialModal = ($btn = null) => {
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    $("#modal-material input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      MaterialModal.appendChild(inputID);
    }

    // edit url & modal title
    MaterialModal.action = $btn ? "/material/update" : "/material/add";
    $("#modal-material-title").text(
      $btn ? "Sửa nguyên vật liệu" : "Thêm nguyên vật liệu"
    );
    document.getElementById("mName").value = $btn?.data("mname") || "";
    document.getElementById("mUnit").value = $btn?.data("munit") || "";
    document.getElementById("mDesc").value = $btn?.data("mdesc") || "";
    changeImgWhenModalOpen(
      $btn?.data("mimg") && $btn.data("mimg") != "default.png",
      `img/materials/${$btn?.data("mimg")}`
    );
  };

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
  //#endregion

  //#region events

  //#region validate
  $("#mName").on("keyup", function () {
    const title = "Tên nguyên vật liệu";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#mUnit").on("keyup", function () {
    const title = "Đơn vị tính";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#mDesc").on("keyup", function () {
    const title = "Mô tả";
    const maxVal = 256;
    let val = $(this).val();
    let cases = [
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  //#endregion

  $(".btn[role=add-material]").on("click", function () {
    prepareMaterialModal();
  });

  $(".btn[role=edit-material]").on("click", function () {
    prepareMaterialModal($(this));
  });

  $("[role=confirm-delete-material]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/material/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/material");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("#mImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      changeImgWhenModalOpen(true, uploadedFile);
    }
  });

  $(".file_remove").on("click", function (e) {
    removeImg();
  });
  //#endregion
  //#endregion
  $("[rel=switch-tab]").on("click", function () {
    $($(this).data("to")).click();
  });

  //#region material requirement
  // event add material
  $("[role=list-material_add]").on("click", function () {
    generateMtrreqItem();
  });

  // event update material delete value
  $(document).on("change", "[role=list-material_select]", function (e) {
    let list_mtr_taken = [];
    $("#mr-list [role=list-material_select]").each(function () {
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

  const checkSelectValue = function () {
    $("#mr-list [name=mId]").each(function () {
      let mtr_selected_id = $(this).find("option:selected").val();
      let cases = [{ con: mtr_selected_id == -1, mess: `Tên NVL là bắt buộc` }];
      checkValidate(cases, this);
    });
  };

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

  $(document).on("click", "[role=list-material_delete]", function () {
    $(this).parent().parent().remove();
  });

  //#region mtrreq submit
  $(".btn[role=add-mtrreq]").on("click", function () {
    prepareMtrreqModal();
  });

  $(".btn[role=edit-mtrreq]").on("click", function () {
    prepareMtrreqModal($(this));
  });

  $("[role=confirm-cancel-mtrreq]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "PATCH",
      url: "/mtrreq/" + id,
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
