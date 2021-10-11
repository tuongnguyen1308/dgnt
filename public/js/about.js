$(document).ready(() => {
  const listTitle = ["Thêm", "Cập nhật"];

  //#region func
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
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $("[role=errMessage]").text("Ảnh không hợp lệ");
      removeImg($(this).parent());
    } else {
      $("[role=errMessage]").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      $(this)
        .parent()
        .find("img")
        .attr("src", uploadedFile)
        .removeClass("d-none");
      $(this).next().addClass("d-none");
      $(this).parent().next().removeClass("d-none");
    }
  });

  $("#banner-form").on("submit", function () {
    let filename = $("#bImg").val();
    const title = "Ảnh";
    let cases = [
      { con: filename == "", mess: `${title} là bắt buộc` },
      {
        con: !filename.match(/\.(jpg|jpeg|png)$/i),
        mess: `${title} không hợp lệ`,
      },
    ];
    checkValidate(cases, document.getElementById("bImg"));
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

  // validate

  $("#pmName").on("keyup", function () {
    const title = "Tên hình thức";
    const maxL = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length > maxL, mess: `${title} tối đa ${maxL} ký tự` },
    ];
    checkValidate(cases, this, false);
  });

  $("#pmDesc").on("keyup", function () {
    const title = "Mô tả";
    const maxL = 255;
    let val = $(this).val();
    let cases = [
      { con: val.length > maxL, mess: `${title} tối đa ${maxL} ký tự` },
    ];
    checkValidate(cases, this, false);
  });

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
  $("#siName").on("keyup", function () {
    const title = "Tên trang";
    const maxL = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} la bắt buộc` },
      { con: val.length > maxL, mess: `${title} tối đa ${maxL} ký tự` },
    ];
    checkValidate(cases, this, false);
  });
  $("#siAddress").on("keyup", function () {
    const title = "Địa chỉ";
    const maxL = 255;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} la bắt buộc` },
      { con: val.length > maxL, mess: `${title} tối đa ${maxL} ký tự` },
    ];
    checkValidate(cases, this, false);
  });
  $("#siHotline").on("keyup", function () {
    const title = "Đường dây nóng";
    const lengthVal = 10;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val.length != lengthVal, mess: `${title} gồm ${lengthVal} ký tự` },
    ];
    checkValidate(cases, this, false);
  });
  $("#siLogo").on("change", function (e) {
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $("[role=errMessage]").text(`Logo không hợp lệ`).removeClass("d-none");
      $(this).val("");
      let datasrc = $(this).data("src");
      if (datasrc) {
        $(this)
          .next()
          .addClass("d-none")
          .parent()
          .find("img")
          .attr("src", datasrc)
          .removeClass("d-none");
      } else {
        $(this)
          .next()
          .removeClass("d-none")
          .parent()
          .find("img")
          .attr("src", "")
          .addClass("d-none");
      }
    } else {
      $("[role=errMessage]").addClass("d-none").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      $(this)
        .next()
        .addClass("d-none")
        .parent()
        .find("img")
        .attr("src", uploadedFile)
        .removeClass("d-none");
    }
  });
  $("#shopinfo-form").on("submit", function (e) {
    $ip_img = $("#siLogo");
    if ($ip_img.attr("required") && $ip_img.val() == "") {
      $("[role=errMessage]").text(`Logo là bắt buộc`).removeClass("d-none");
      e.preventDefault();
      e.stopPropagation();
    }
  });
  //#endregion

  //#endregion
});
