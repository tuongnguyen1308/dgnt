$(document).ready(() => {
  const ip_username = document.getElementById("username");
  const formModal = document.getElementById("modal-staff");
  const modalTitle = document.getElementById("modal-staff-title");
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
  };

  $(".btn[role=edit-staff]").on("click", function () {
    prepareModal($(this));
  });

  $(".btn[role=add-staff]").on("click", function () {
    prepareModal();
  });
});
