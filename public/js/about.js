$(document).ready(() => {
  $('[rel="tooltip"]').tooltip({ trigger: "hover" });
  // sortable list

  //#region func
  let changeImg = (con, src) => {
    if (con) {
      $("#img-preview").attr("src", src).removeClass("d-none");
      $("#bImg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    } else removeImg();
  };
  let removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#bImg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };
  //#endregion

  //#region events

  //#region banner
  $(".sortable-list").sortable({
    handle: ".panel-handle",
    update: function () {
      let listSrc = [];
      $(".sortable-list .list-group-item").each(function (index, elem) {
        $li = $(elem);
        let bImg = $li.find("img").attr("src");
        bImg = bImg.split("/").at(-1);
        listSrc.push({
          bImg,
          bNumber: $li.index() + 1,
        });
      });
      $.ajax({
        type: "post",
        url: "/about/banner-update/",
        data: JSON.stringify(listSrc),
        contentType: "application/json",
        success: function (res) {
          res?.result && console.log("Update Success!");
          res?.err && console.log(res.err);
        },
        error: function (err) {
          console.error(err);
        },
      });
    },
  });
  $(".btn[role=delete-banner]").on("click", function () {
    $(this).next().toggleClass("show");
  });
  $("[role=confirm-delete-banner]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/about/banner-delete/" + id,
      success: function (res) {
        res.result && $(`#${id}`).remove();
        res.err && console.log(res.err);
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  $("[rel=cancel-delete-banner]").on("click", function () {
    $(this).parent().parent().removeClass("show");
  });

  //#endregion

  //#region Profile
  $("#bImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["png", "jpg", "jpeg"]) == -1) {
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

  //#endregion
});
