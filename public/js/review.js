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
});
