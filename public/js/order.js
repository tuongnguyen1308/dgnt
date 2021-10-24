$(document).ready(function () {
  //#region func
  let generateImg = (src, fname) => {
    let imgTemp = document.querySelector("#img-preview-template");
    let imgItem = imgTemp.content.cloneNode(true);
    let imgEle = imgItem.querySelector("img");
    imgEle.src = src;
    imgEle.dataset.fname = fname;
    $("#reviewImgs").append(imgItem);
  };
  //#endregion
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

  $("#reviewImg").on("change", function (e) {
    $("#reviewImgs").html("");
    imgFiles = e.target.files;
    let isValid = true;
    Array.from(imgFiles).forEach((f) => {
      if (isValid) {
        isValid = f.name.match(/\.(jpg|jpeg|png)$/i);
        let cases = [{ con: !isValid, mess: `Ảnh không hợp lệ` }];
        let reviewImg = document.getElementById("reviewImg");
        checkValidate(cases, reviewImg);
        if (isValid) {
          var src = URL.createObjectURL(f);
          generateImg(src, f.name);
        } else {
          $("#reviewImgs").html("");
          $(this).val("");
        }
      }
    });
  });
});
