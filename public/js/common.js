let generateToast = (state, text) => {
  if ("content" in document.createElement("template")) {
    let toastTemplate = document.querySelector("#toast-template");
    let newToast = toastTemplate.content.cloneNode(true);
    let toastWrap = newToast.querySelector(".toast");
    toastWrap.setAttribute("id", "custom-toast");
    let toastColor = newToast.querySelector(".toast-header");
    toastColor.classList.add(state ? "bg-success" : "bg-danger");
    let toastIcon = newToast.querySelector("span");
    toastIcon.setAttribute(
      "data-feather",
      state ? "check-circle" : "alert-circle"
    );
    let toastTitle = newToast.querySelector("strong");
    toastTitle.textContent = state ? "Thàng công" : "Thất bại";
    let toastText = newToast.querySelector(".toast-body");
    toastText.textContent = text;
    $(".container-fluid.position-relative").append(newToast);
    const toastElement = document.getElementById("custom-toast");
    feather.replace({ "aria-hidden": "true" });
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    setTimeout(() => {
      $("#custom-toast").remove();
    }, 3000);
  } else {
    console.log("không hỗ trợ toast");
  }
};
$(document).ready(function () {
  // show current activated tab
  let curTab = localStorage.getItem("cur-tab");
  if (document.getElementById(curTab)) $(`#${curTab}`).click();
  else $("#nav-tab button:first-child").click();
  // toast
  const toastElement = document.getElementById("toast");
  if (toastElement) {
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // tooltip
  $('[rel="tooltip"]').tooltip({ trigger: "hover" });

  // feather
  feather.replace({ "aria-hidden": "true" });

  // form validate
  $("form.needs-validation").submit(function (e) {
    if (!this.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass("was-validated");
    }
  });

  // tab active
  $("[role=tab]").on("click", function (e) {
    localStorage.setItem("cur-tab", $(this).attr("id"));
  });

  // logout show
  $("[role=open-dropdown]").on("click", function () {
    $(this).next().toggleClass("show");
  });
  $("[rel=close-dropdown]").on("click", function () {
    $(this).parent().parent().removeClass("show");
  });
  $(document).click((e) => {
    if (!["BUTTON", "line", "svg", "A"].includes(e.target.tagName)) {
      $(".dropdown-menu.show").removeClass("show");
    }
  });

  //#region customer
  // set height cho banner
  if (document.getElementsByClassName("carousel-item"))
    $(".carousel-item").height($(".carousel-item img").width() * 0.38);

  // scroll handle
  let last_scroll_y = window.scrollY;
  $(window).on("scroll", function () {
    let current_scroll_y = this.scrollY;
    if (current_scroll_y < last_scroll_y) {
      $("nav.navbar").addClass("scrolled-up").removeClass("scrolled-down");
    } else {
      $("nav.navbar").addClass("scrolled-down").removeClass("scrolled-up");
    }
    last_scroll_y = current_scroll_y;
  });

  //#region modal-signup
  const removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#cimg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };
  $("#cImg").on("change", function (e) {
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Ảnh không hợp lệ");
      removeImg();
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      $("#img-preview").attr("src", uploadedFile).removeClass("d-none");
      $("#cimg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    }
  });
  $(".file_remove").on("click", function (e) {
    removeImg();
  });

  //#region validate
  let checkValidate = (cases, inp) => {
    let invailArr = cases.filter((cs) => cs.con);
    if (invailArr.length > 0) {
      inp.setCustomValidity("error");
      $(inp).next().next().text(invailArr[0].mess);
    } else {
      inp.setCustomValidity("");
    }
  };
  $("#su_username").on("keyup", function () {
    const title = "Tên tài khoản";
    const maxVal = 50;
    let val = $.trim($(this).val());
    $(this).val(val);
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.includes(" "), mess: `${title} không được chứa khoảng trắng` },
      { con: val.length >= maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });
  $("#su_password").on("keyup", function () {
    const title = "Mật khẩu";
    const minVal = 6;
    const maxVal = 50;
    let val = $.trim($(this).val());
    $(this).val(val);
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length < minVal, mess: `${title} tối thiểu ${minVal} ký tự` },
      { con: val.includes(" "), mess: `${title} không được chứa khoảng trắng` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#su_repassword").on("keyup", function () {
    const title = "Nhập lại mật khẩu";
    let val = $.trim($(this).val());
    $(this).val(val);
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val !== $("#su_password").val(), mess: `${title} không đúng` },
    ];
    checkValidate(cases, this);
  });

  $("#cName").on("keyup", function () {
    const title = "Họ tên";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#cNumber").on("keyup", function () {
    const title = "Số điện thoại";
    const lengthVal = 10;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val.length != lengthVal, mess: `${title} gồm ${lengthVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  //#endregion

  $("[rel=call-modal]").on("click", function () {
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
  });

  //#endregion

  //#endregion
});
