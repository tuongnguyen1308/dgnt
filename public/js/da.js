$(document).ready(() => {
  let prepareDAModal = ($btn = null) => {
    $("#modal-da input").val("");
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      $("#modal-da").append(inputID);
      $("#adReceiver").val($btn.data("rec"));
      $("#adNumber").val($btn.data("num"));
      $("#adProvince").val($btn.data("pro")).trigger("change");
      $("#adDistrict").val($btn.data("dis")).trigger("change");
      $("#adWard").val($btn.data("war"));
      $("#adDetail").val($btn.data("detail"));
      $("#adIsDefault").attr("checked", $btn.data("default"));
    }

    // edit url & modal title
    $("#modal-da").attr("action", $btn ? "/da/update" : "/da/add");
    $("#modal-da-title").text($btn ? "Sửa " : "Thêm ");
  };

  let provinces = [];
  let districts = [];
  let wards = [];
  $.ajax({
    type: "GET",
    url: "/provinces",
    success: function (res) {
      provinces = res;
      provinces.map((p) => {
        let op = document.createElement("option");
        op.value = p.name;
        $("#provinces").append(op);
      });
    },
    error: function (err) {
      console.error(err);
    },
  });

  const validateAddress = (ip, division, fullCheck = false) => {
    const title = $(ip).attr("placeholder");
    let val = $(ip).val();
    let invalid = true;
    $(`#${division} option`).each(function () {
      let opVal = $(this).val();
      if (fullCheck) {
        if (opVal == val) invalid = false;
      } else {
        if (opVal.includes(val)) invalid = false;
      }
    });
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: invalid, mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, ip, false);
  };

  $(".btn[role=add-da]").on("click", function () {
    prepareDAModal();
  });

  $(".btn[role=edit-da]").on("click", function () {
    prepareDAModal($(this));
  });

  $("[role=del-da]").on("click", function () {
    const id = $(this).data("id");
    $.ajax({
      type: "DELETE",
      url: "/da/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/personal");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("#adProvince").on("keyup", function () {
    validateAddress(this, "provinces", false);
  });

  $("#adProvince").on("change", function () {
    validateAddress(this, "provinces", true);
    let ipVal = $(this).val();
    districts = provinces.find((p) => p.name == ipVal)?.districts;
    if (districts) {
      $("#districts").html("");
      districts.map((d) => {
        let op = document.createElement("option");
        op.value = d.name;
        $("#districts").append(op);
      });
    }
  });

  $("#adDistrict").on("keyup", function () {
    validateAddress(this, "districts", false);
  });

  $("#adDistrict").on("change", function () {
    validateAddress(this, "districts", true);
    let ipVal = $(this).val();
    wards = districts.find((d) => d.name == ipVal)?.wards;
    if (wards) {
      $("#wards").html("");
      wards.map((d) => {
        let op = document.createElement("option");
        op.value = d.name;
        $("#wards").append(op);
      });
    }
  });

  $("#adWard").on("keyup", function () {
    validateAddress(this, "wards", false);
  });

  $(document).on("keyup", "input[name=adDetail]", function () {
    const title = $(this).attr("placeholder");
    let val = $(this).val();
    let maxlength = 255;
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > 255, mess: `${title} tối đa ${maxlength} ký tự` },
    ];
    checkValidate(cases, this, false);
  });

  $("#modal-da").on("submit", function () {
    validateAddress(document.getElementById("adProvince"), "provinces", true);
    validateAddress(document.getElementById("adDistrict"), "districts", true);
    validateAddress(document.getElementById("adWard"), "wards", true);
  });
});
