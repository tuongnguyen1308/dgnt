$(document).ready(() => {
  if ($(".desc")) {
    $(".desc").parent().html($(".desc").data("desc"));
  }
  //#region func
  const updateQuantity = (pId, pQuantity) => {
    $.ajax({
      type: "PATCH",
      url: "/cart/update",
      data: { pId, pQuantity },
      success: function (res) {
        console.log(res.m);
      },
      error: function (err) {
        console.error(err);
      },
    });
  };

  const changeQuantity = ($ip, num = 0) => {
    if (num != 0) $ip.val(Number($ip.val()) + Number(num));
    let totalPrdPrice = ($ip.data("price") * $ip.val()).toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    });
    // update total product price
    $ip
      .parentsUntil("#cart-prds")
      .find("[rel=total-prd-price]")
      .text(totalPrdPrice);
    // update total cart price
    let totalCartPrice = 0;
    $("#cart-prds [name=prd-quan]").each(function () {
      totalCartPrice += Number($(this).data("price") * $(this).val());
    });
    $("[rel=total-cart-price]").text(
      totalCartPrice.toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      })
    );
    if ($ip.val() != "" && $ip.val() != 0)
      updateQuantity($ip.data("pid"), $ip.val());
  };
  //#endregion

  //#region event
  $("[rel=sub-quantity]").on("click", function () {
    $ip = $(this).next();
    if (Number($ip.val()) > 1) changeQuantity($ip, -1);
  });
  $("[rel=add-quantity]").on("click", function () {
    $ip = $(this).prev();
    if (Number($ip.val()) < $ip.attr("max")) changeQuantity($ip, 1);
  });
  $("[name=prd-quan]").on("keydown", function (e) {
    const specialChar = "~`!@#$%^&*()-=+[{}]|\\;,.:'\"<>/?";
    if (specialChar.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
    switch (e.keyCode) {
      case 38:
        if (Number($(this).val()) < $(this).attr("max"))
          changeQuantity($(this), 1);
        break;
      case 40:
        if (Number($(this).val()) > 1) changeQuantity($(this), -1);
        break;
    }
  });
  $("[name=prd-quan]").on("keyup", function (e) {
    changeQuantity($(this));
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
});
