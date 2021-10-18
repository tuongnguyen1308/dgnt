$(document).ready(() => {
  $("input[name=pmId]").on("click", function () {
    $("[rel=pmDesc]").addClass("d-none");
    $(this).parent().find("[rel=pmDesc]").removeClass("d-none");
  });
});
