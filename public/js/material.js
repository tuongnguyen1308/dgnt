$(document).ready(() => {
  //#region modal
  const MaterialModal = document.getElementById("modal-material");
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
    const maxVal = 255;
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
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Ảnh không hợp lệ!");
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
});
