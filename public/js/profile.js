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
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
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
  $("#newPassword").on("keyup", function () {
    checkPassword($(this).val().length >= 6, this);
  });

  $("#newPassword2").on("keyup", function () {
    checkPassword($(this).val() == $("#newPassword").val(), this);
  });
  //#endregion
  //#endregion
});
