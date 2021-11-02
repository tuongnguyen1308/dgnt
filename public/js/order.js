$(document).ready(function () {
  $(".btn[role=update-state]").on("click", function () {
    let title = $(this).find(".title").text();
    if (title == "Hủy")
      $("#modal-state [name=oNote]")
        .prop("required", true)
        .parent()
        .removeClass("d-none");
    else
      $("#modal-state [name=oNote]")
        .prop("required", false)
        .parent()
        .addClass("d-none");
    $("#modal-state").attr("action", "order/update-state");
    $("#modal-state input[name=oId]").val($(this).data("id"));
    $("#modal-state input[name=sdId]").val($(this).data("state"));
    $("#modal-state-title").text($(this).find(".title").text());
  });
});
