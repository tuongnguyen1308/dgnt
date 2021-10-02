$(document).ready(() => {
  const curPage = "product";
  const redirectUrl = "/product-manager";
  const formModal = document.getElementById("category-form");
  //#region func
  let setImg = ($parent, src) => {
    $parent.find(".img-preview").attr("src", src).removeClass("d-none");
    $parent.find("#pcImg").next().addClass("d-none");
    $parent.find(".file_remove").removeClass("d-none");
  };
  let removeImg = ($parent) => {
    $parent.find("img").attr("src", "#").addClass("d-none");
    $parent.find(".title").removeClass("d-none");
    $parent.next().addClass("d-none");
    $parent.find("input").val("");
  };
  let prepareForm = ($btn = null) => {
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    $("#category-form input#id").remove();
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
  $(".btn[role=add-category]").on("click", function () {
    prepareForm();
  });

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

  $("#pcImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      setImg($(this).parent().parent(), uploadedFile);
    }
  });

  $(".file_remove").on("click", function (e) {
    removeImg($(this).prev());
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
