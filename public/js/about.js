$(document).ready(() => {
  const listTitle = ["Thêm", "Cập nhật"];

  //#region func
  let changeImg = (con, src, tab) => {
    if (con) {
      $(`${tab} #img-preview`).attr("src", src).removeClass("d-none");
      $(`${tab} .upload-before .title`).addClass("d-none");
      $(`${tab} .file_remove`).removeClass("d-none");
    } else removeImg();
  };
  let removeImg = () => {
    $(`${tab} #img-preview`).attr("src", "#").addClass("d-none");
    $(`${tab} .upload-before .title`).removeClass("d-none");
    $(`${tab} .file_remove`).addClass("d-none");
  };

  let changePMState = () => {
    let state = $("#pmState").is(":checked") ? "Hiện" : "Ẩn";
    $("#pmState").next().text(state);
  };

  let prepareForm = ($btn) => {
    const pmForm = document.getElementById("pm-form");
    $("#pmId").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "pmId";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      pmForm.appendChild(inputID);
      $("#pm-btn_cancel").removeClass("d-none");
    } else {
      $("#pm-btn_cancel").addClass("d-none");
    }
    pmForm.action = $btn ? "/about/pm-update" : "/about/pm-add";
    document.getElementById("pmName").value = $btn?.data("pmname") || "";
    document.getElementById("pmDesc").value = $btn?.data("pmdesc") || "";
    document.getElementById("pmState").checked = $btn?.data("pmstate") === "";
    $("#pm-title").text(`${listTitle[$btn ? 1 : 0]} hình thức`);
  };

  //#endregion

  //#region events

  //#region banner
  $("#bImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      changeImg(true, uploadedFile, "#nav-banner");
    }
  });

  $(".file_remove").on("click", function (e) {
    removeImg();
  });
  $(".sortable-list").sortable({
    handle: ".panel-handle",
    update: function () {
      let listSrc = [];
      $(".sortable-list .list-group-item").each(function (index, elem) {
        $li = $(elem);
        let bImg = $li.find("img").attr("src");
        bImg = bImg.split("/").at(-1);
        listSrc.push({
          bImg,
          bNumber: $li.index() + 1,
        });
      });
      $.ajax({
        type: "post",
        url: "/about/banner-update/",
        data: JSON.stringify(listSrc),
        contentType: "application/json",
        success: function (res) {
          res?.result && console.log("Update Success!");
          res?.err && console.log(res.err);
          generateToast(res.result, "Cập nhật thành công!");
        },
        error: function (err) {
          generateToast(false, "Cập nhật thất bại!");
          console.error(err);
        },
      });
    },
  });
  $("[role=confirm-delete-banner]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    const bimg = $target.data("bimg");
    $.ajax({
      type: "DELETE",
      url: "/about/banner-delete/" + bimg,
      success: function (res) {
        if (res.result && !res.err) {
          $(`#${id}`).remove();
          generateToast(res.result, "Xóa thành công!");
        } else {
          generateToast(res.result, res.err);
        }
      },
      error: function (err) {
        generateToast(false, err);
      },
    });
  });
  //#endregion

  //#region payment method
  $("#pmState").on("change", function () {
    changePMState();
  });

  $(".btn[role=edit-pm]").on("click", function () {
    prepareForm($(this));
  });

  $("#pm-btn_cancel").on("click", function () {
    prepareForm();
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
  });

  $("[role=confirm-delete-pm]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/about/pm-delete/" + id,
      success: function (res) {
        if (res.result && !res.err) {
          window.location.replace("/about");
          // $(`#${id}`).remove();
          // generateToast(res.result, "Xóa thành công!");
        } else {
          generateToast(res.result, res.err);
        }
      },
      error: function (err) {
        generateToast(false, err);
      },
    });
  });
  //#endregion

  //#region shop info
  $("#siLogo").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      changeImg(true, uploadedFile, "#nav-shopinfo");
    }
  });
  //#endregion

  //#endregion
});
