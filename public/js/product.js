$(document).ready(() => {
  const curPage = "product";
  const formModal = document.getElementById("modal-product");
  const modalTitle = document.getElementById("modal-product-title");

  let imgFiles = [];
  //#region func
  // generate mtr item
  let generatemcItem = (mId, mName, mQuantity) => {
    let valided = true;
    let list_mtr_taken = [];
    $("#mc-list input[name=mId]").each(function () {
      let mtr_selected_id = $(this).val();
      list_mtr_taken[mtr_selected_id] = 1;
      if (list_mtr_taken[mId] != 1) {
        $("#mc-error").addClass("d-none").text("");
      } else {
        $("#mc-error").removeClass("d-none").text("NVL đã được thêm trước đó");
        valided = false;
      }
    });
    if (valided) {
      let mtrItemTemplate = document.querySelector("#mc-item-template");
      let mrItem = mtrItemTemplate.content.cloneNode(true);
      let mIdInput = mrItem.querySelector("[name=mId]");
      mIdInput.value = mId;
      let mNameSpan = mrItem.querySelector("[rel=material-name]");
      mNameSpan.innerText = mName;
      if (mQuantity) {
        let mQuantitySelector = mrItem.querySelector("[name=mQuantity]");
        mQuantitySelector.value = mQuantity;
      }
      $("#mc-list").append(mrItem);
      feather.replace({ "aria-hidden": "true" });
    }
  };
  // generate prd img item
  let generateImg = (src, fname) => {
    let imgTemp = document.querySelector("#img-preview-template");
    let imgItem = imgTemp.content.cloneNode(true);
    let imgEle = imgItem.querySelector("img");
    imgEle.src = src;
    imgEle.dataset.fname = fname;
    $("#pImgs").append(imgItem);
  };
  let prepareModal = ($btn = null) => {
    // remove old validate
    $(".was-validated .is-valid, .was-validated .is-invalid").removeClass(
      "is-valid is-invalid"
    );
    $(".was-validated").removeClass("was-validated");
    $("#pImg").val("");
    $("#modal-product input#id").remove();
    $("#pImgs").html("");
    $("#mc-list>tr").html("");
    $("#mc-error").text("");
    $("#pImg").attr("required", true);
    $("#main-img").attr("src", "").addClass("d-none");
    if ($btn) {
      let inputID = document.createElement("input");
      inputID.id = "id";
      inputID.name = "id";
      inputID.value = $btn.data("id");
      inputID.type = "hidden";
      formModal.appendChild(inputID);
      let mConsume = $btn.data("mcon");
      mConsume.map((m) => {
        generatemcItem(m.mId._id, m.mId.mName, m.mQuantity);
      });
      let imgs = $btn.data("imgs");
      imgs.map((img) => {
        let src = `img/products/${img.piImg}`;
        generateImg(src, img.piImg);
        if (img.piIsMain) {
          $("#main-img").attr("src", src).removeClass("d-none");
          $("#mainimg-inp").val(img.piImg);
        }
      });
      $("#pImg").attr("required", false);
    }
    formModal.action = $btn ? "/product/update" : "/product/add";
    modalTitle.innerText = $btn ? "Sửa" : "Thêm";
    document.getElementById("pcId").value = $btn?.data("pcid") || -1;
    document.getElementById("pName").value = $btn?.data("name") || "";
    document.getElementById("pUnit").value = $btn?.data("unit") || "";
    document.getElementById("pSize").value = $btn?.data("size") || "";
    document.getElementById("pPrice").value = $btn?.data("price") || "";
    document.getElementById("pDiscount").value = $btn?.data("discount") || "";
    calculateMtotal();
    document.getElementById("pDesc").innerText = $btn?.data("desc") || "";
    $(".note-editable").html($btn?.data("desc") || "");
    document.getElementById("pState").checked = $btn?.data("state") === "";
    $("#pState").trigger("change");
    // changeImgWhenModalOpen(
    //   $btn?.data("pImg") && $btn.data("pImg") != "",
    //   `img/${curPage}/${$btn?.data("pImg")}`
    // );
  };
  //#endregion

  //#region events
  $(".btn[role=add-product]").on("click", function () {
    prepareModal();
  });
  // find material
  $("[rel=find-material]").on("click", function () {
    const keyword = $("[name=mfind]").val();
    $.ajax({
      type: "POST",
      url: "/material/find",
      data: { keyword },
      success: function (res) {
        $("#listMtrconItem").html("");
        res.map((m) => {
          let resultItemTemp = document.querySelector("#search-result-temp");
          let resItem = resultItemTemp.content.cloneNode(true);
          let iImg = resItem.querySelector("img");
          iImg.src = `img/materials/` + m.mImg;
          let iId = resItem.querySelector("li");
          iId.dataset.id = m._id;
          let iName = resItem.querySelector("h5");
          iName.innerText = m.mName;
          $("#listMtrconItem").append(resItem);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // add mtr
  $(document).on("click", "[role=list-mtrcon_add]", function () {
    generatemcItem($(this).data("id"), $(this).find("h5").text());
  });
  // del mtr
  $(document).on("click", "[role=list-mc_delete]", function () {
    $(this).parent().parent().remove();
  });

  $(document).on("click", ".btn[role=edit-product]", function () {
    prepareModal($(this));
  });

  $(document).on("click", "[role=confirm-delete-product]", function (e) {
    $target = $(e.target);
    const id = $target.data("id");
    $.ajax({
      type: "DELETE",
      url: "/product/" + id,
      success: function (res) {
        console.log(res);
        window.location.replace("/product");
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  $("#pState").on("change", function () {
    $(this)
      .next()
      .text($(this).is(":checked") ? "Hiện" : "Ẩn");
  });

  $("#pImg").on("change", function (e) {
    $("#pImgs").html("");
    $("#main-img").attr("src", "#").addClass("d-none");
    $("#mainimg-inp").val("");
    imgFiles = e.target.files;
    let isValid = true;
    Array.from(imgFiles).forEach((f) => {
      if (isValid) {
        isValid = f.name.match(/\.(jpg|jpeg|png)$/i);
        let cases = [{ con: !isValid, mess: `Ảnh không hợp lệ` }];
        let pImg = document.getElementById("pImg");
        checkValidate(cases, pImg);
        if (isValid) {
          var src = URL.createObjectURL(f);
          generateImg(src, f.name);
          $("#main-img").attr("src", src).removeClass("d-none");
          $("#mainimg-inp").val(f.name);
          feather.replace({ "aria-hidden": "true" });
          $('[rel="tooltip"]').tooltip({ trigger: "hover" });
        } else {
          $("#main-img").attr("src", "#").addClass("d-none");
          $("#mainimg-inp").val("");
          $("#pImgs").html("");
          $(this).val("");
        }
      }
    });
  });

  $(document).on("click", ".sub-img", function () {
    $("#main-img").attr("src", $(this).attr("src")).removeClass("d-none");
    $("#mainimg-inp").val($(this).data("fname"));
  });

  // $(document).on("click", ".file-remove", function () {
  //   if ($(this).prev().attr("src") == $("#main-img").attr("src")) {
  //     $prevImg = $(this).parent().prev().find("img");
  //     if ($prevImg.length > 0) {
  //       $("#main-img").attr("src", $prevImg.attr("src"));
  //     } else {
  //       $("#main-img").addClass("d-none").attr("src", "");
  //     }
  //   }
  //   $(this).parent().remove();
  // });

  //#region validate
  $("#pcId").on("change", function () {
    let cases = [
      {
        con: $("#pcId").find("option:selected").val() == -1,
        mess: `Danh mục là bắt buộc`,
      },
    ];
    let sltpcId = document.getElementById("pcId");
    checkValidate(cases, sltpcId);
  });

  $("#pName").on("keyup", function () {
    const title = "Tên sản phẩm";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#pUnit").on("keyup", function () {
    const title = "Đơn vị tính";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#pSize").on("keyup", function () {
    const title = "Kích thước";
    const maxVal = 50;
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val.length > maxVal, mess: `${title} tối đa ${maxVal} ký tự` },
    ];
    checkValidate(cases, this);
  });

  $("#pPrice").on("keyup", function () {
    const title = "Giá";
    let val = $(this).val();
    let cases = [
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val % 1 != 0, mess: `${title} không hợp lệ` },
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val <= 0, mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $("#pDiscount").on("keyup", function () {
    const title = "Giảm giá";
    let maxVal = 100;
    let val = $(this).val();
    let cases = [
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val % 1 != 0, mess: `${title} không hợp lệ` },
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val < 0, mess: `${title} không hợp lệ` },
      { con: val > 100, mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $(document).on("keyup", "[name=mQuantity], [name=pQuantity]", function () {
    const title = "Số lượng";
    let val = $(this).val();
    let cases = [
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: val % 1 != 0, mess: `${title} không hợp lệ` },
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val <= 0, mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this);
  });

  $("#modal-product").on("submit", function (e) {
    let cases = [
      {
        con: $("#pcId").find("option:selected").val() == -1,
        mess: `Danh mục là bắt buộc`,
      },
    ];
    let sltpcId = document.getElementById("pcId");
    checkValidate(cases, sltpcId);
    if ($("#mc-list [name=mId]").length == 0) {
      e.preventDefault();
      e.stopPropagation();
      $("#mc-error").removeClass("d-none").text("Danh sách NVL là bắt buộc");
    } else {
      $("#mc-error").addClass("d-none").text("");
    }
  });

  const calculateMtotal = () => {
    const price = $("#pPrice").val();
    const discount = $("#pDiscount").val() || 0;
    if (!isNaN(price)) {
      let total = (price - (price * discount) / 100).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      });
      $("#pFinalPrire").text(total);
    }
  };

  $("#pPrice").on("keyup", function () {
    calculateMtotal();
  });

  $("#pDiscount").on("keyup", function () {
    calculateMtotal();
  });

  $("[name=prdRoom]").on("change", function () {
    let rtId = $(this).val();
    $("[name=prdCate]").val(-1);
    $("[name=prdCate] option:not([value=-1])").each(function (index) {
      let rel = $(this).attr("rel");
      $(this).attr("hidden", rel != rtId);
    });
  });
  //#endregion
  //#endregion
});
