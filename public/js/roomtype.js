$(document).ready(() => {
  const curPage = "product";
  const redirectUrl = "/product-management";
  const formModal = document.getElementById("roomtype-form");
  //#region func
  let setImg = ($parent, src) => {
    $parent.find(".img-preview").attr("src", src).removeClass("d-none");
    $parent.find("#rtImg").next().addClass("d-none");
    $parent.find(".file_remove").removeClass("d-none");
  };
  let prepareForm = ($btn = null) => {
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    $("#roomtype-form input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      formModal.appendChild(inputID);
      setImg(
        $("#rtImg").parent().parent(),
        `img/roomtypes/${$btn?.data("img")}`
      );
    } else {
      removeImg($("#rtImg").parent());
    }
    $("#rtImg").attr("required", $btn ? false : true);
    formModal.action = $btn ? "/roomtype/update" : "/roomtype/add";
    $("#roomtype-form .form-title").text(
      ($btn ? "Sửa" : "Thêm") + " loại phòng"
    );
    document.getElementById("rtName").value = $btn?.data("name") || "";
  };
  //#endregion

  //#region events
  $(".btn[role=add-roomtype]").on("click", function () {
    prepareForm();
  });

  $(".btn[role=edit-roomtype]").on("click", function () {
    prepareForm($(this));
  });
  $(".btn[role=form-roomtype-reset]").on("click", function () {
    prepareForm();
  });

  $("[role=confirm-delete-roomtype]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/roomtype/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace(redirectUrl);
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("#rtImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "png", "jpg", "jpeg"]) == -1) {
      $(this)
        .parent()
        .parent()
        .find("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
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
  //#endregion
});