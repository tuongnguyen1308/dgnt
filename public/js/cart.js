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
    calcCartPrice();
    if ($ip.val() != "" && $ip.val() != 0)
      updateQuantity($ip.data("pid"), $ip.val());
  };

  const calcCartPrice = () => {
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
  $("[role=remove-product]").on("click", function () {
    $tr = $(this).parentsUntil(".prd").parent();
    let pId = $(this).data("pid");
    $.ajax({
      type: "PATCH",
      url: "/cart/remove-product",
      data: { pId },
      success: function (res) {
        if (!res.s) {
          $("#err-text").text(res.m);
        } else {
          $("#cart-prd-num").text(`(${res.d.products.length})`);
          let cartNum = res.d.products.reduce(
            (pp, np) => Number(pp) + Number(np.pQuantity),
            0
          );
          $("#cartNum").text(cartNum);
          $("#err-text").text("");
          $tr.remove();
          calcCartPrice();
        }
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
  //#endregion
});
