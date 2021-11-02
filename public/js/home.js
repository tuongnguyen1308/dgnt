$(document).ready(() => {
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
  if ($(".desc")) {
    $(".desc").parent().html($(".desc").data("desc"));
  }
  $inpQuan = $("[name=cdQuantity]");
  //#region func
  const changeQuantity = (num) => {
    $inpQuan.val(Number($inpQuan.val()) + Number(num));
  };
  //#endregion

  //#region event
  $("[rel=sub-quantity]").on("click", function () {
    if (Number($inpQuan.val()) > 0) changeQuantity(-1);
  });
  $("[rel=add-quantity]").on("click", function () {
    if (Number($inpQuan.val()) < $inpQuan.attr("max")) changeQuantity(1);
  });
  $inpQuan.on("keydown", function (e) {
    if (!/^[0-9]$/i.test(e.key) && e.key != "Backspace") {
      e.preventDefault();
      e.stopPropagation();
    }
    switch (e.keyCode) {
      case 38:
        if (Number($inpQuan.val()) < $inpQuan.attr("max")) changeQuantity(1);
        break;
      case 40:
        if (Number($inpQuan.val()) > 0) changeQuantity(-1);
        break;
    }
  });

  // add product to cart
  $("#cart-add-product").on("click", function () {
    let pId = $(this).val();
    let pQuantity = $("#cdQuantity").val();
    $.ajax({
      type: "POST",
      url: "/cart/add",
      data: { pId, pQuantity },
      success: function (res) {
        if (!res.s) {
          console.log(res.m);
          $("#err-text")
            .removeClass("text-success")
            .addClass("text-danger")
            .text(res.m);
        } else {
          let cartNum = res.d.products.reduce(
            (pp, np) => Number(pp) + Number(np.pQuantity),
            0
          );
          $("#cartNum").text(cartNum);
          $("#err-text")
            .removeClass("text-danger")
            .addClass("text-success")
            .text("Đã thêm vào giỏ hàng");
        }
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // find-product
  $("#search-input").on("keyup", function () {
    const keyword = $(this).val();
    if (keyword.length > 0)
      $.ajax({
        type: "POST",
        url: "/find-product",
        data: { keyword },
        success: function (res) {
          $("#listPrdFound").html("").addClass("show");
          res.map((p) => {
            let resultItemTemp = document.querySelector("#searchp-result-temp");
            let resItem = resultItemTemp.content.cloneNode(true);
            let iImg = resItem.querySelector("img");
            iImg.src =
              `img/products/` + p.pImgs.find((pi) => pi.piIsMain).piImg;
            let aHref = resItem.querySelector("a");
            aHref.href = `/${p.slugName}`;
            let iId = resItem.querySelector("li");
            iId.dataset.id = p._id;
            let iName = resItem.querySelector("h5");
            iName.innerText = p.pName;
            let iPrice = resItem.querySelector("p");
            iPrice.innerText = (
              p.pPrice -
              (p.pPrice * p.pDiscount) / 100
            ).toLocaleString("vi", { style: "currency", currency: "VND" });
            $("#listPrdFound").append(resItem);
          });
        },
        error: function (err) {
          console.error(err);
        },
      });
    else $("#listPrdFound").html("").removeClass("show");
  });
  //#endregion

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
