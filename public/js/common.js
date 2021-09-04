$(document).ready(function () {
  const toastElement = document.getElementById("toast");
  if (toastElement) {
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
  feather.replace({ "aria-hidden": "true" });

  $("[rel=logout-request]").on("click", function () {
    $(this).next().toggleClass("show");
  });

  $("[rel=logout-cancel]").on("click", function () {
    $(this).parent().parent().removeClass("show");
  });
  $(document).click((e) => {
    if (!["BUTTON", "line", "svg", "A"].includes(e.target.tagName)) {
      $(".dropdown-menu.show").removeClass("show");
    }
  });
});
