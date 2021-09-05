$(document).ready(() => {
  const ip_username = document.getElementById("aUsername");
  const formModal = document.getElementById("modal-staff");
  const modalTitle = document.getElementById("modal-staff-title");
  $('[rel="tooltip"]').tooltip({ trigger: "hover" });
  //#region func
  let removeImg = () => {
    $("#img-preview").attr("src", "#").addClass("d-none");
    $("#simg-preview .title").removeClass("d-none");
    $(".file_remove").addClass("d-none");
  };

  let changeImgWhenModalOpen = (con, src) => {
    if (con) {
      $("#img-preview").attr("src", src).removeClass("d-none");
      $("#simg-preview .title").addClass("d-none");
      $(".file_remove").removeClass("d-none");
    } else removeImg();
  };
  let prepareModal = ($btn = null) => {
    $("#modal-staff input#id").remove();
    $("#modal-staff input#aid").remove();
    if ($btn) {
      ip_username.removeAttribute("name");
      ip_username.disabled = true;
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      formModal.appendChild(inputID);
      let inputaId = document.createElement("input");
      inputaId.id = "aid";
      inputaId.name = "aid";
      inputaId.value = $btn.data("aid");
      inputaId.type = "hidden";
      formModal.appendChild(inputaId);
    } else {
      ip_username.removeAttribute("disabled");
      ip_username.setAttribute("name", "aUsername");
    }
    formModal.action = $btn ? "/staff/update" : "/staff/add";
    modalTitle.innerText = $btn ? "Sửa thành viên" : "Thêm thành viên";
    ip_username.value = $btn?.data("ausername") || "";
    console.log($btn?.data("rid"));
    $btn?.data("rid")
      ? (document.getElementById("rId").value = $btn.data("rid"))
      : "";
    document.getElementById("sName").value = $btn?.data("sname") || "";
    let dofb = $btn?.data("sdofb") || "";
    document.getElementById("sDofB").value = dofb?.slice(0, 10) || "";
    document.getElementById("sNumber").value = $btn?.data("snumber") || "";
    document.getElementById("sEmail").value = $btn?.data("semail") || "";
    document.getElementById("sState").checked = $btn?.data("sstate") === "";
    $("#sState").trigger("change");
    changeImgWhenModalOpen(
      $btn?.data("simg") && $btn.data("simg") != "default.png",
      `img/users/${$btn?.data("simg")}`
    );
  };
  let changeWorkingState = () => {
    let state = $("#sState").is(":checked") ? "Đang làm việc" : "Đã nghỉ";
    $("#sState").next().text(state);
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

  $("#sState").on("change", function () {
    changeWorkingState();
  });

  $("#sImg").on("change", function (e) {
    var ext = $(this).val().split(".").pop().toLowerCase();
    if ($.inArray(ext, ["gif", "png", "jpg", "jpeg"]) == -1) {
      $("[role=errMessage]")
        .removeClass("d-none")
        .find("span")
        .text("Không đúng định dạng!");
    } else {
      $("[role=errMessage]").addClass("d-none").find("span").text("");
      var uploadedFile = URL.createObjectURL(e.target.files[0]);
      changeImgWhenModalOpen(true, uploadedFile);
    }
  });

  $(".file_remove").on("click", function (e) {
    removeImg();
  });
  //#endregion
});
