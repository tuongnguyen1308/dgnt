//#region global function
const generateToast = (state, text) => {
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

const checkValidate = (cases, inp, immidiate_check = true) => {
  let invailArr = cases.filter((cs) => cs.con);
  if (invailArr.length > 0) {
    immidiate_check && $(inp).parent().addClass("was-validated");
    inp.setCustomValidity("error");
    $(inp).parent().find(".invalid-feedback").text(invailArr[0].mess);
  } else {
    inp.setCustomValidity("");
  }
};

const removeImg = ($parent) => {
  $parent.find("img").attr("src", "#").addClass("d-none");
  $parent.find(".title").removeClass("d-none");
  $parent.next().addClass("d-none");
  $parent.find("input").val("");
};
// validate max input number
$(document).on("keydown", "[max]", function (e) {
  let maxval = Number($(this).attr("max"));
  let dcv = $(this).val();
  if (dcv + e.key > maxval && /^[0-9]$/i.test(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
});

$(document).on("keydown", "input[type=number], [name=o_year]", function (e) {
  if ([69, 231].includes(e.keyCode)) {
    e.preventDefault();
    e.stopPropagation();
  }
});

const listKeyAllow = [
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
  "Delete",
  "Backspace",
  "Tab",
  "Shift",
  "Ctrl",
];

const specialChar = "~`!#$%^&*()-=+[{}]|\\;:'\"<>/?";
//#endregion

$(document).ready(function () {
  // show current activated tab
  let curTab = localStorage.getItem("cur-tab");
  if (document.getElementById(curTab)) $(`#${curTab}`).click();
  else $("#nav-tab button.nav-link:first-child").click();
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

  // summernote
  if ($(".summernote").length > 0) {
    $(".summernote").summernote({
      toolbar: [
        ["style", ["bold", "italic", "underline", "clear"]],
        ["font", ["strikethrough", "superscript", "subscript"]],
        ["para", ["ul", "ol"]],
        ["insert", ["hr", "link", "video"]],
      ],
    });
  }

  // logout show
  $(document).click((e) => {
    if (
      $("[role=open-dropdown]").has(e.target).length == 0 &&
      !$("[role=open-dropdown]").is(e.target)
    ) {
      $(".dropdown-menu").removeClass("show");
    }
  });
  $(document).on("click", "[role=open-dropdown]", function () {
    $(this).next().toggleClass("show");
  });
  $(document).on("click", "[rel=close-dropdown]", function () {
    $(this).parent().parent().removeClass("show");
  });

  // switch tab
  let gotoTab = window.location.hash;
  window.history.replaceState({}, document.title, window.location.pathname);
  if (gotoTab.length > 0) {
    $(`${gotoTab}-tab`).click();
  }
  $("[rel=switch-tab]").on("click", function () {
    $($(this).data("to")).click();
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
  $("#cImg").on("change", function (e) {
    const filename = $(this).val();
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Ảnh không hợp lệ");
      removeImg($(this));
      $(this).val("");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      $("#img-preview").attr("src", uploadedFile).removeClass("d-none");
      $("#cimg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    }
  });
  $(document).on("click", ".file_remove", function (e) {
    removeImg($(this).prev());
  });

  //#region validate

  $(
    "#si_username, #si_password, #su_username, #su_password, #su_repassword, #aUsername, #aPassword"
  ).on("keydown", function (e) {
    if (e.keyCode == 32) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $("#su_username, #aUsername").on("keyup", function () {
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
  $("#su_password, #aPassword").on("keyup", function () {
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
    checkValidate(cases, this, true);
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

  $("#cName, #sName").on("keyup", function () {
    const title = "Họ tên";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#cNumber, #sNumber, #adNumber").on("keyup", function () {
    const title = "Số điện thoại";
    const lengthVal = 10;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val.length != lengthVal, mess: `${title} gồm ${lengthVal} ký tự` },
    ];
    checkValidate(cases, this, false);
  });
  $(
    "#cNumber, #sNumber, #siHotline, #adNumber, [name=prd-quan], [name=o_year]"
  ).on("keydown", function (e) {
    if (!/^[0-9]$/i.test(e.key) && !listKeyAllow.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $("#sDofB").on("change", function () {
    const title = "Ngày sinh";
    let val = new Date($(this).val()).getTime();
    let curDate = new Date();
    let cases = [
      { con: val >= curDate.getTime(), mess: `${title} không hợp lệ` },
      {
        con: curDate.getFullYear() - $(this).val().slice(0, 4) < 18,
        mess: `Nhân viên phải đủ 18 tuổi`,
      },
    ];
    checkValidate(cases, this);
  });

  $("#cDofB").on("change", function () {
    const title = "Ngày sinh";
    let val = new Date($(this).val()).getTime();
    let curDate = new Date();
    let cases = [
      { con: val >= curDate.getTime(), mess: `${title} không hợp lệ` },
      {
        con: curDate.getFullYear() - $(this).val().slice(0, 4) < 18,
        mess: `Khách hàng phải đủ 18 tuổi`,
      },
    ];
    checkValidate(cases, this);
  });

  $("#cEmail, #sEmail").on("keydown", function (e) {
    if (specialChar.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $("#cEmail, #sEmail").on("keyup", function () {
    const title = "Email";
    let val = $(this).val();
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: !re.test(val), mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this, false);
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

  $(document).on("click", "[data-gallery=photoviewer]", function (e) {
    e.preventDefault();

    var items = [],
      options = {
        index: $(this).index(),
        resizable: false,
        initMaximized: true,
        headerToolbar: ["close"],
      };

    $("[data-gallery=photoviewer]").each(function () {
      items.push({
        src: $(this).attr("href"),
        title: $(this).attr("data-title"),
      });
    });

    new PhotoViewer(items, options);
    $(document).on("keyup", function (e) {
      // esc
      if (e.keyCode == 27) {
        $(".photoviewer-button-close").click();
      }
    });
  });
});
