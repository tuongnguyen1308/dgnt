$(document).ready(() => {
  const curPage = "product-type";
  const formModal = document.getElementById("modal-product-type");
  const modalTitle = document.getElementById("modal-product-type-title");
  $('[rel="tooltip"]').tooltip({ trigger: "hover" });
  //#region func
  let removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#tImg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };

  let changeImgWhenModalOpen = (con, src) => {
    if (con) {
      $("#img-preview").attr("src", src).removeClass("d-none");
      $("#tImg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    } else removeImg();
  };
  let prepareModal = ($btn = null) => {
    $("#modal-product-type input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      formModal.appendChild(inputID);
    }
    formModal.action = $btn ? "/product-type/update" : "/product-type/add";
    modalTitle.innerText = $btn ? "Sửa loại sản phẩm" : "Thêm loại sản phẩm";
    document.getElementById("tName").value = $btn?.data("tName") || "";
    document.getElementById("tState").checked = $btn?.data("tState") === "";
    $("#tState").trigger("change");
    changeImgWhenModalOpen(
      $btn?.data("tImg") && $btn.data("tImg") != "",
      `img/${curPage}/${$btn?.data("tImg")}`
    );
  };
  let changetState = () => {
    let state = $("#tState").is(":checked") ? "Hiện" : "Ẩn";
    $("#tState").next().text(state);
  };
  let findProductType = (keyword) => {
    $(`.card:contains(${keyword})`).removeClass("d-none");
    $(`.card:not(:contains(${keyword}))`).addClass("d-none");
  };
  //#endregion

  //#region events
  $(".btn[role=add-product-type]").on("click", function () {
    prepareModal();
  });

  $(".btn[role=edit-product-type]").on("click", function () {
    prepareModal($(this));
  });

  $(".btn[role=delete-product-type]").on("click", function () {
    $(this).next().toggleClass("show");
  });

  $("[role=confirm-delete-product-type]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/product-type/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/product-type");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("[rel=cancel-delete-product-type]").on("click", function () {
    $(this).parent().parent().removeClass("show");
  });
  $(document).click((e) => {
    if (!["BUTTON", "line", "svg"].includes(e.target.tagName)) {
      $(".dropdown-menu.show").removeClass("show");
    }
  });

  $("#tState").on("change", function () {
    changetState();
  });

  $("#tImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "png", "jpg", "jpeg"]) == -1) {
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

  $("#search").on("keyup", function () {
    findProductType($(this).val());
  });
  //#endregion
});
