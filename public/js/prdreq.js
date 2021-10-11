$(document).ready(() => {
  const redirectUrl = "/product-management";
  const PrdreqlModal = document.getElementById("modal-prdreq");
  //#region func
  let generatePrdreqItem = (pId, pName, pQuantity) => {
    let valided = true;
    let list_prd_taken = [];
    $("#pr-list input[name=pId]").each(function () {
      let prd_selected_id = $(this).val();
      list_prd_taken[prd_selected_id] = 1;
      if (list_prd_taken[pId] != 1) {
        $("#pr-error").addClass("d-none").text("");
      } else {
        $("#pr-error")
          .removeClass("d-none")
          .text("Sản phẩm đã được thêm trước đó");
        valided = false;
      }
    });
    if (valided) {
      let prItemTemplate = document.querySelector("#pr-item-template");
      let prItem = prItemTemplate.content.cloneNode(true);
      let pIdInput = prItem.querySelector("[name=pId]");
      pIdInput.value = pId;
      let pNameSpan = prItem.querySelector("[rel=product-name]");
      pNameSpan.innerText = pName;
      if (pQuantity) {
        let pQuantitySelector = prItem.querySelector("[name=pQuantity]");
        pQuantitySelector.value = pQuantity;
      }
      $("#pr-list").append(prItem);
      feather.replace({ "aria-hidden": "true" });
    }
  };

  let preparePrdreqModal = ($btn = null) => {
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    // remove & recreate old Id
    $("#modal-prdreq input#id").remove();
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      PrdreqlModal.appendChild(inputID);
    }

    // edit url & modal title
    PrdreqlModal.action = $btn ? "/prdreq/update" : "/prdreq/add";
    $("#modal-prdreq-title").text(
      $btn ? "Sửa yêu cầu nhập sản phẩm" : "Thêm yêu cầu nhập sản phẩm"
    );
    document.getElementById("prReason").value = $btn?.data("reason") || "";
    $("#pr-list tr").remove();
    if ($btn) {
      const detail = $btn.data("detail");
      detail.map((p) => {
        generatePrdreqItem(p.pId._id, p.pId.pName, p.pQuantity);
      });
    }
    let curDate = $btn ? $btn.data("deadline") : new Date().toISOString();
    $("#prDeadlineAt").val(curDate.slice(0, 10));
    $("select").trigger("change");
  };
  //#endregion

  //#region validate
  $("#modal-prdreq").on("submit", function (e) {
    if ($("#pr-list [name=pId]").length == 0) {
      console.log("invalid");
      e.preventDefault();
      e.stopPropagation();
      $("#pr-error")
        .removeClass("d-none")
        .text("Danh sách sản phẩm là bắt buộc");
    } else {
      console.log("valid");
      $("#pr-error").addClass("d-none").text("");
    }
  });
  //#endregion

  //#region events
  // call modal
  $(".btn[role=add-prdreq]").on("click", function () {
    preparePrdreqModal();
  });

  // find-product
  $("[rel=find-product]").on("click", function () {
    const keyword = $("[name=pfind]").val();
    $.ajax({
      type: "POST",
      url: "/product/find",
      data: { keyword },
      success: function (res) {
        $("#listPrdreqItem").html("");
        res.map((p) => {
          let resultItemTemp = document.querySelector("#search-result-temp");
          let resItem = resultItemTemp.content.cloneNode(true);
          let iImg = resItem.querySelector("img");
          iImg.src = `img/products/` + p.pImgs.find((pi) => pi.piIsMain).piImg;
          let iId = resItem.querySelector("li");
          iId.dataset.id = p._id;
          let iName = resItem.querySelector("h5");
          iName.innerText = p.pName;
          let iPrice = resItem.querySelector("p");
          iPrice.innerText = (
            p.pPrice -
            (p.pPrice * p.pDiscount) / 100
          ).toLocaleString("vi", { style: "currency", currency: "VND" });
          $("#listPrdreqItem").append(resItem);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // add prd
  $(document).on("click", "[role=list-prdreq_add]", function () {
    generatePrdreqItem($(this).data("id"), $(this).find("h5").text());
  });
  // del prd
  $(document).on("click", "[role=list-prdreq_delete]", function () {
    $(this).parent().parent().remove();
  });
  // call modal
  $(".btn[role=edit-prdreq]").on("click", function () {
    preparePrdreqModal($(this));
  });
  // cancel prdreq
  $("[role=update-state-prdreq]").on("click", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    const prState = $target.data("state");
    $.ajax({
      type: "PATCH",
      url: "/prdreq/" + id,
      data: { prState },
      success: function (res) {
        console.log(res);
        window.location.replace(redirectUrl);
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  //#endregion
});
