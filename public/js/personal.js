$(document).ready(() => {
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
      { con: val.includes(" "), mess: `${title} không được chứa khoảng trắng` },
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
});
