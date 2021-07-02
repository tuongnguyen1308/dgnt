$(document).ready(() => {
  const ip_username = document.getElementById("username");
  const formModal = document.getElementById("modal-staff");
  const modalTitle = document.getElementById("modal-staff-title");
  $('[rel="tooltip"]').tooltip({ trigger: "hover" });
  //#region func
  let removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#avatar-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };

  let ChangeImgWhenModalOpen = (con, src) => {
    if (con) {
      $("#img-preview").attr("src", src).removeClass("d-none");
      $("#avatar-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    } else removeImg();
  };
  let prepareModal = ($btn = null) => {
    $("#modal-staff input#id").remove();
    if ($btn) {
      ip_username.removeAttribute("name");
      ip_username.disabled = true;
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      formModal.appendChild(inputID);
    } else {
      ip_username.removeAttribute("disabled");
      ip_username.setAttribute("name", "username");
    }
    formModal.action = $btn ? "/staff/update" : "/staff/add";
    modalTitle.innerText = $btn ? "Sửa thành viên" : "Thêm thành viên";
    ip_username.value = $btn?.data("username") || "";
    document.getElementById("rNumber").value = $btn?.data("rnumber") || 2;
    document.getElementById("fullname").value = $btn?.data("fullname") || "";
    document.getElementById("phone").value = $btn?.data("phone") || "";
    document.getElementById("email").value = $btn?.data("email") || "";
    ChangeImgWhenModalOpen(
      $btn?.data("avatar") && $btn.data("avatar") != "default.png",
      `img/users/${$btn.data("avatar")}`
    );
  };
  //#endregion

  //#region events
  $(".btn[role=add-staff]").on("click", function () {
    prepareModal();
  });

  $(".btn[role=edit-staff]").on("click", function () {
    prepareModal($(this));
  });

  $(".btn[role=delete-staff]").on("click", function () {
    $(this).next().toggleClass("show");
  });

  $("[role=confirm-delete-staff]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/staff/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/staff");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("[rel=cancel-delete-staff]").on("click", function () {
    $(this).parent().parent().removeClass("show");
  });
  $(document).click((e) => {
    if (!["BUTTON", "line", "svg"].includes(e.target.tagName)) {
      $(".dropdown-menu.show").removeClass("show");
    }
  });

  const inputFile = $("#avatar");
  inputFile.on("change", function (e) {
    var ext = inputFile.val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      ChangeImgWhenModalOpen(true, uploadedFile);
    }
  });

  $(".file_remove").on("click", function (e) {
    removeImg();
  });
  //#endregion
});
