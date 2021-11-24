$(document).ready(() => {
  $("[role=update-state-review]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    const rState = $target.data("state");
    $.ajax({
      type: "PATCH",
      url: "/review/" + id,
      data: { rState },
      success: function (res) {
        console.log(res);
        window.location.replace("/review");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // find-product
  $("[rel=find-product]").on("keyup", function () {
    const keyword = $("[name=pName]").val();
    $.ajax({
      type: "POST",
      url: "/product/find",
      data: { keyword },
      success: function (res) {
        $("#products").html("");
        res.map((p) => {
          $op = $("<option/>").val(p.pName);
          $("#products").append($op);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  $("[rel=find-product]").on("change", function () {
    $(this).blur();
  });
});
