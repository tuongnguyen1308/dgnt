$(document).ready(() => {
  const curPage = "product";
  const redirectUrl = "/product-management";
  const formModal = document.getElementById("category-form");
  //#region func
  let setImg = ($parent, src) => {
    $parent.find(".img-preview").attr("src", src).removeClass("d-none");
    $parent.find("#pcImg").next().addClass("d-none");
    $parent.find(".file_remove").removeClass("d-none");
  };
  let prepareForm = ($btn = null) => {
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    $("#category-form input#id").remove();
    $("#category-form details").attr("open", $btn ? true : false);
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      formModal.appendChild(inputID);
      setImg(
        $("#pcImg").parent().parent(),
        `img/categories/${$btn?.data("img")}`
      );
    } else {
      removeImg($("#pcImg").parent());
    }
    $("#pcImg").attr("required", $btn ? false : true);
    formModal.action = $btn ? "/category/update" : "/category/add";
    $("#category-form .form-title").text(($btn ? "Sửa" : "Thêm") + " danh mục");
    document.getElementById("pcName").value = $btn?.data("name") || "";
    document.getElementById("rtId").value = $btn?.data("rtid") || "";
  };
  //#endregion

  //#region events
  $(".btn[role=edit-category]").on("click", function () {
    prepareForm($(this));
  });
  $(".btn[role=form-category-reset]").on("click", function () {
    prepareForm();
  });

  $("[role=confirm-delete-category]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/category/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace(redirectUrl);
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("#pcName").on("keyup", function () {
    const title = "Tên danh mục";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#pcImg").on("change", function (e) {
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $(this)
        .parent()
        .parent()
        .find("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Ảnh không hợp lệ!");
    } else {
      $(this)
        .parent()
        .parent()
        .find("[role=errMessage]")
        .addClass("d-none")
        .find("span")
        .text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      setImg($(this).parent().parent(), uploadedFile);
    }
  });

  $("#category-form").on("submit", function (e) {
    let cases = [
      {
        con: $("#rtId").find("option:selected").val() == -1,
        mess: `Loại phòng là bắt buộc`,
      },
    ];
    let sltRtId = document.getElementById("rtId");
    checkValidate(cases, sltRtId);
  });
  //#endregion
});
