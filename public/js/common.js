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
});
