$(document).ready(() => {
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
      console.log(e.key);
      e.preventDefault();
      e.stopPropagation();
    }
  });
  $("[data-gallery=photoviewer]").click(function (e) {
    e.preventDefault();

    var items = [],
      options = {
        index: $(this).index(),
        resizable: false,
        initMaximized: true,
        headerToolbar: ["close"],
      };

    $("[data-gallery=photoviewer]").each(function () {
      items.push({
        src: $(this).attr("href"),
        title: $(this).attr("data-title"),
      });
    });

    new PhotoViewer(items, options);
    $(document).on("keyup", function (e) {
      // esc
      if (e.keyCode == 27) {
        $(".photoviewer-button-close").click();
      }
    });
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
