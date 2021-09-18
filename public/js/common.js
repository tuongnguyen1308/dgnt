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

  // modal-signup
  const removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#cimg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };
  $("#cImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
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

  let checkPassword = (con, inp) => inp.setCustomValidity(con ? "" : "error");
  //#region Change Password
  $("#su_password").on("keyup", function () {
    checkPassword($(this).val().length >= 6, this);
  });

  $("#su_repassword").on("keyup", function () {
    checkPassword($(this).val() == $("#su_password").val(), this);
  });
  //#endregion
  $("[rel=call-modal]").on("click", function () {
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
  });

  //#endregion
});
