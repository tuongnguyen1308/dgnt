$(document).ready(() => {
  const appModal = document.getElementById("modal-app");
  const appResModal = document.getElementById("modal-app-res");
  //#region func
  const setCustomer = (id, cimg, cname, cnumber) => {
    $("input[name=cId]").val(id);
    $("[rel=cimg]").attr("src", cimg.length ? `img/users/${cimg}` : "");
    $("[rel=cname]").text(cname);
    $("[rel=cnumber]").text(cnumber);
  };
  const prepareappModal = ($btn = null) => {
    $("input").val("");
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    $("#modal-app input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      appModal.appendChild(inputID);
      let apTime = $btn.data("time");
      $("#apTime").val(apTime.slice(0, 19));
    }

    // edit url & modal title
    appModal.action = $btn ? "/appointmentM/update" : "/appointmentM/add";
    $("#modal-app-title").text($btn ? "Sửa " : "Thêm ");
    $("#apLocation").val($btn?.data("location") || "");
    let customer = $btn?.data("customer") || {};
    setCustomer(
      customer?._id || "",
      customer?.cImg || "",
      customer?.cName || "",
      customer?.cNumber || ""
    );
  };

  const prepareaUdpAppModal = ($btn) => {
    $("input").val("");
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    $("#modal-app-res input[name=id]").val($btn.data("id"));
    let apTime = $btn.data("time");
    let apDate = apTime.slice(0, 10).split("-").reverse().join("/");
    $("[rel=time]").text(`${apDate} ${apTime.slice(11, 19)}`);
    $("[rel=location]").text($btn.data("location"));
    $("#apResult").text($btn.data("res"));
    let customer = $btn.data("customer");
    setCustomer(customer._id, customer.cImg, customer.cName, customer.cNumber);
  };
  //#endregion

  //#region events

  //#region validate
  $("#apTime").on("keyup", function () {
    const title = "Thời gian";
    let val = $(this).val();
    let cases = [{ con: val.length == 0, mess: `${title} là bắt buộc` }];
    checkValidate(cases, this, false);
  });

  $("#apLocation").on("keyup", function () {
    const title = "Địa điêm";
    const maxVal = 255;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#apResult").on("keyup", function () {
    const title = "Kết quả";
    const maxVal = 255;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#modal-app").on("submit", function (e) {
    if ($("input[name=cId]").val() == "") {
      e.preventDefault();
      e.stopPropagation();
      $(".submit-error").removeClass("d-none").text("Khách hàng là bắt buộc");
      let cases = [{ con: true, mess: `Khách hàng là bắt buộc` }];
      checkValidate(cases, document.getElementById("cfind"));
    } else {
      $(".submit-error").addClass("d-none").text("");
    }
  });
  //#endregion

  $(".btn[role=add-app]").on("click", function () {
    prepareappModal();
  });

  $(".btn[role=edit-app]").on("click", function () {
    prepareappModal($(this));
  });

  $(".btn[role=upd-app]").on("click", function () {
    prepareaUdpAppModal($(this));
  });

  $("[rel=delete-app]").on("click", function () {
    const id = $(this).data("id");
    $.ajax({
      type: "DELETE",
      url: "/appointmentM/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/appointmentM");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // find customer
  $("[rel=find-customer]").on("click", function () {
    const keyword = $("[name=cfind]").val();
    $.ajax({
      type: "POST",
      url: "/appointmentM/find-customers",
      data: { keyword },
      success: function (res) {
        $("#customers-found").html("");
        res.map((c) => {
          let cfTemp = document.querySelector("#customers-found-temp");
          let cfLi = cfTemp.content.cloneNode(true);
          let cImg = cfLi.querySelector("img");
          cImg.src = `img/users/` + c.cImg;
          let liId = cfLi.querySelector("li");
          liId.dataset.id = c._id;
          liId.dataset.cimg = c.cImg;
          liId.dataset.cname = c.cName;
          liId.dataset.cnumber = c.cNumber;
          let cName = cfLi.querySelector("h4");
          cName.innerText = c.cName;
          let cNumber = cfLi.querySelector("span");
          cNumber.innerText = c.cNumber;
          $("#customers-found").append(cfLi);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // select customer
  $(document).on("click", "[rel=select-customer]", function () {
    setCustomer(
      $(this).data("id"),
      $(this).data("cimg"),
      $(this).data("cname"),
      $(this).data("cnumber")
    );
    let cases = [{ con: false, mess: `Khách hàng là bắt buộc` }];
    checkValidate(cases, document.getElementById("cfind"));
  });
  //#endregion
});
