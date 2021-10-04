$(document).ready(() => {
  const curPage = "product";
  const formModal = document.getElementById("modal-product");
  const modalTitle = document.getElementById("modal-product-title");

  let imgFiles = [];
  //#region func
  // generate mtr item
  let generatemcItem = (mId, mQuantity) => {
    let mcItemTemplate = document.querySelector("#mc-item-template");
    let mcItem = mcItemTemplate.content.cloneNode(true);
    if (mId) {
      let mIdSelector = mcItem.querySelector("[name=mId]");
      mIdSelector.value = mId;
    }
    if (mQuantity) {
      let mQuantitySelector = mcItem.querySelector("[name=mQuantity]");
      mQuantitySelector.value = mQuantity;
    }
    $("#mc-list").append(mcItem);
    feather.replace({ "aria-hidden": "true" });
    let cases = [{ con: true, mess: `Tên NVL là bắt buộc` }];
    checkValidate(cases, $("#mc-list tr:last-child select").get(0), false);
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
  // let changeImgWhenModalOpen = (con, src) => {
  //   if (con) {
  //     $("#img-preview").attr("src", src).removeClass("d-none");
  //     $("#pImg-preview .title").addClass("d-none");
  //     $(".file_remove").removeClass("d-none");
  //   }
  // };
  let prepareModal = ($btn = null) => {
    $("#modal-product input#id").remove();
    $("#pImgs").html("");
    $("#mc-list>tr").html("");
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
        generatemcItem(m.mId, m.mQuantity);
        $("[name=mId]").trigger("change");
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

  // add mtr
  $("[role=list-mc_add]").on("click", function () {
    generatemcItem();
  });
  // change mtr
  $(document).on("change", "[role=list-mc_select]", function (e) {
    let list_mtr_taken = [];
    $("#mc-list [role=list-mc_select]").each(function () {
      let mtr_selected_id = $(this).find("option:selected").val();
      if (mtr_selected_id != -1) {
        if (list_mtr_taken[mtr_selected_id] != 1) {
          list_mtr_taken[mtr_selected_id] = 1;
          let cases = [{ con: false, mess: `` }];
          checkValidate(cases, this);
        } else {
          let cases = [{ con: true, mess: `NVL này đã được thêm trước đó` }];
          checkValidate(cases, this);
        }
      }
    });
  });
  // del mtr
  $(document).on("click", "[role=list-mc_delete]", function () {
    $(this).parent().parent().remove();
  });

  $(".btn[role=edit-product]").on("click", function () {
    prepareModal($(this));
  });

  $("[role=confirm-delete-product]").on("click", function (e) {
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
    imgFiles = e.target.files;
    Array.from(imgFiles).forEach((f) => {
      let cases = [
        { con: f["type"].split("/")[0] !== "image", mess: `Ảnh không hợp lệ` },
      ];
      let pImg = document.getElementById("pImg");
      checkValidate(cases, pImg);
      if (f["type"].split("/")[0] === "image") {
        var src = URL.createObjectURL(f);
        generateImg(src, f.name);
        $("#main-img").attr("src", src).removeClass("d-none");
        $("#mainimg-inp").val(f.name);
        feather.replace({ "aria-hidden": "true" });
        $('[rel="tooltip"]').tooltip({ trigger: "hover" });
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

  $("#modal-product").on("submit", function () {
    let cases = [
      {
        con: $("#pcId").find("option:selected").val() == -1,
        mess: `Danh mục là bắt buộc`,
      },
    ];
    let sltpcId = document.getElementById("pcId");
    checkValidate(cases, sltpcId);
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

  $("#pDiscount").on("keydown", function (e) {
    let dcv = $(this).val();
    if (dcv >= 10 && /^[0-9]$/i.test(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $("#pDiscount").on("keyup", function () {
    calculateMtotal();
  });
  //#endregion
  //#endregion
});
