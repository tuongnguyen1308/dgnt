$(document).ready(() => {
  //#region func
  let changeImg = (con, src) => {
    if (con) {
      $("#img-preview").attr("src", src).removeClass("d-none");
      $("#simg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    } else removeImg();
  };
  let removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#simg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };
  let checkPassword = (con, inp) => inp.setCustomValidity(con ? "" : "error");
  //#endregion

  //#region events

  //#region Profile
  $("#sImg").on("change", function (e) {
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Ảnh không hợp lệ!");
      $(this).val("");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      changeImg(true, uploadedFile);
    }
  });

  $(".file_remove").on("click", function (e) {
    removeImg();
  });
  //#endregion

  //#region Change Password
  $("#newPassword, #newPassword2, #oldPassword").on("keydown", function (e) {
    console.log(e.keyCode);
    if (e.keyCode == 32) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  $("#newPassword").on("keyup", function () {
    const title = "Mật khẩu";
    const minVal = 6;
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length < minVal, mess: `${title} tối thiểu ${minVal} ký tự` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this, false);
  });

  $("#newPassword2").on("keyup", function () {
    const title = "Nhập lại mật khẩu mới";
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val !== $("#newPassword").val(), mess: `${title} không đúng` },
    ];
    checkValidate(cases, this, false);
  });
  //#endregion
  //#endregion
});
