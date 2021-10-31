$(document).ready(function () {
  //#region func
  const setCustomer = (id, cimg, cname, cnumber) => {
    $("input[name=cId]").val(id);
    $("[rel=cimg]").attr("src", cimg.length ? `img/users/${cimg}` : "");
    $("[rel=cname]").text(cname);
    $("[rel=cnumber]").text(cnumber);
  };

  const generateorderItem = (pId, pName, odPrice, stock) => {
    let valided = true;
    let list_prd_taken = [];
    $("#products-list input[name=pId]").each(function () {
      let prd_selected_id = $(this).val();
      list_prd_taken[prd_selected_id] = 1;
      if (list_prd_taken[pId] != 1) {
        $("#products-error").addClass("d-none").text("");
      } else {
        $("#products-error")
          .removeClass("d-none")
          .text("Sản phẩm đã được thêm trước đó");
        valided = false;
      }
    });
    if (valided) {
      let prItemTemplate = document.querySelector("#products-item-template");
      let prItem = prItemTemplate.content.cloneNode(true);
      let pIdInput = prItem.querySelector("[name=pId]");
      pIdInput.value = pId;
      let pNameSpan = prItem.querySelector("[rel=product-name]");
      pNameSpan.innerText = pName;
      let odPriceInput = prItem.querySelector("[name=odPrice]");
      odPriceInput.value = odPrice;
      let odQuantityInput = prItem.querySelector("[name=odQuantity]");
      odQuantityInput.max = stock;
      let pStockSpan = prItem.querySelector("[rel=stock]");
      pStockSpan.innerText = "SL trong kho: " + stock;
      let priceSpan = prItem.querySelector("[rel=product-price]");
      priceSpan.innerText = odPrice.toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      });
      $("#products-list").append(prItem);
      feather.replace({ "aria-hidden": "true" });
    }
  };

  const calculatePtotal = ($tr) => {
    const price = $tr.find("[name=odPrice]").val();
    const quantity = $tr.find("[name=odQuantity]").val();
    if (!isNaN(price)) {
      let total = (price * quantity).toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      });
      $tr.find("[rel=pTotal]").text(total);
      return price * quantity;
    }
    return 0;
  };

  const calculateOrderTotal = () => {
    let orderTotal = 0;
    $("#products-list tr").each(function (index) {
      orderTotal += calculatePtotal($(this));
    });
    $("[rel=order-total]").text(
      orderTotal.toLocaleString("vi", { style: "currency", currency: "VND" })
    );
    $("input[name=oTotal]").val(orderTotal);
  };
  //#endregion

  $("input[name=pmId]").on("click", function () {
    $("[rel=pmDesc]").addClass("d-none");
    $(this).parent().find("[rel=pmDesc]").removeClass("d-none");
  });

  $("#modal-order").on("submit", function (e) {
    if ($("input[name=cId]").val() == "") {
      e.preventDefault();
      e.stopPropagation();
      $(".submit-error").removeClass("d-none").text("Khách hàng là bắt buộc");
      let cases = [{ con: true, mess: `Khách hàng là bắt buộc` }];
      checkValidate(cases, document.getElementById("cfind"));
    } else {
      $(".submit-error").addClass("d-none").text("");
    }
    if ($("#products-list [name=pId]").length == 0) {
      e.preventDefault();
      e.stopPropagation();
      $("#products-error")
        .removeClass("d-none")
        .text("Danh sách sản phẩm là bắt buộc");
    } else {
      $("#products-error").addClass("d-none").text("");
    }
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
    let cId = $(this).data("id");
    $.ajax({
      type: "POST",
      url: "/orderM/find",
      data: { cId },
      success: function (res) {
        $("select[name=adId]").html("");
        res.map((da) => {
          let op = $("<option/>")
            .attr("selected", da.adIsDefault)
            .val(da._id)
            .text(
              `${da.adReceiver} - ${da.adNumber}. ${da.adDetail}, ${
                da.adWard
              }, ${da.adDistrict}, ${da.adProvince} ${
                da.adIsDefault ? "(Mặc định)" : ""
              }`
            );
          $("select[name=adId]").append(op);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
    let cases = [{ con: false, mess: `Khách hàng là bắt buộc` }];
    checkValidate(cases, document.getElementById("cfind"));
  });
  //#endregion

  // find-product
  $("[rel=find-product]").on("click", function () {
    const keyword = $("[name=pfind]").val();
    $.ajax({
      type: "POST",
      url: "/product/find",
      data: { keyword },
      success: function (res) {
        $("#listorderItem").html("");
        res.map((p) => {
          let resultItemTemp = document.querySelector("#searchp-result-temp");
          let resItem = resultItemTemp.content.cloneNode(true);
          let iImg = resItem.querySelector("img");
          iImg.src = `img/products/` + p.pImgs.find((pi) => pi.piIsMain).piImg;
          let iId = resItem.querySelector("li");
          iId.dataset.id = p._id;
          let iName = resItem.querySelector("h5");
          iName.innerText = p.pName;
          let iPrice = resItem.querySelector("p");
          let price = p.pPrice - (p.pPrice * p.pDiscount) / 100;
          iId.dataset.price = price;
          iId.dataset.stock = p.pStock;
          iPrice.innerText = price.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          });
          $("#listorderItem").append(resItem);
        });
      },
      error: function (err) {
        console.error(err);
      },
    });
  });

  // add prd
  $(document).on("click", "[role=list-order_add]", function () {
    generateorderItem(
      $(this).data("id"),
      $(this).find("h5").text(),
      $(this).data("price"),
      $(this).data("stock")
    );
  });
  // del prd
  $(document).on("click", "[role=list-order_delete]", function () {
    $(this).parent().parent().remove();
    calculateOrderTotal();
  });

  $(document).on("keyup", "[name=odPrice], [name=odQuantity]", function (e) {
    calculateOrderTotal();
  });

  // call modal
  $(".btn[role=update-state]").on("click", function () {
    $("#modal-state input[name=oRecDate]")?.parent().remove();
    if ($(this).data("recdate")) {
      let recdateTemp = document.querySelector("#recdate-temp");
      let recdate = recdateTemp.content.cloneNode(true);
      $("#modal-state input[name=oId]").parent().prepend(recdate);
    }
    $("#modal-state input[name=oId]").val($(this).data("id"));
    $("#modal-state input[name=sdId]").val($(this).data("state"));
    $("#modal-state input[name=sn]").val($(this).data("sn"));
    $("#modal-state-title").text($(this).find(".title").text());
  });

  $(".btn[role=update-money]").on("click", function () {
    $("#modal-money input[name=oId]").val($(this).data("id"));
    let rest = $(this).data("money");
    let restDisplay = rest.toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    });
    $("#modal-money input[name=oAmountPaid]").val(rest);
    $("#modal-money [rel=order-money]").text(restDisplay);
    $("#modal-money-title").text($(this).find(".title").text());
  });

  //#region validate
  $(document).on("change", "input[name=oRecDate]", function () {
    const title = $(this).attr("placeholder");
    let val = new Date($(this).val());
    let cases = [{ con: val == "Invalid Date", mess: `${title} không hợp lệ` }];
    checkValidate(cases, this);
  });
  $(document).on("keyup", "input[name=odQuantity]", function () {
    const title = $(this).attr("placeholder");
    let val = $(this).val();
    let cases = [
      { con: val.length == 0, mess: `${title} là bắt buộc` },
      { con: val <= 0, mess: `${title} không hợp lệ` },
      { con: isNaN(val), mess: `${title} không hợp lệ` },
      { con: !Number.isInteger(Number(val)), mess: `${title} không hợp lệ` },
    ];
    checkValidate(cases, this, false);
  });
  //#endregion
});
