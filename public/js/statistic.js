$(document).ready(() => {
  const curPage = "product";
  let o_typeChoosen, r_typeChoosen;
  let formatCurrency = (money) =>
    money.toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    });

  const changeInput = (typeC, typeS) => {
    switch (typeC) {
      case "number":
        $(`[rel=${typeS}_type]`).text("Tháng");
        $(`input[name=${typeS}_year]`).removeClass("d-none");
        $(`input[name=${typeS}_month]`).addClass("d-none").val("");
        break;
      case "month":
        $(`[rel=${typeS}_type]`).text("Ngày");
        $(`input[name=${typeS}_year]`).addClass("d-none").val("");
        $(`input[name=${typeS}_month]`).removeClass("d-none");
        break;
    }
  };

  //#region order
  $("input[name=o_type]").on("click", function () {
    o_typeChoosen = $(this).val();
    changeInput(o_typeChoosen, "o");
  });

  $("button[name=o_submit]").on("click", function () {
    if ($("input[name=o_type]:checked").length == 0) {
      $("[rel=o_err]").text("Chưa chọn kiểu thống kê");
      $("input[name=o_type]").focus();
    } else {
      $("[rel=o_err]").text("");
      let data = {
        year: $("input[name=o_year]").val(),
        month: $("input[name=o_month]").val(),
      };
      if (data.year == "" && data.month == "") {
        $("[rel=o_err]").text(
          `${o_typeChoosen == "number" ? "Năm" : "Tháng - năm"} là bắt buộc`
        );
      } else {
        $("[rel=o_err]").text("");
        $.ajax({
          type: "POST",
          url: "/orderM/statistic",
          data,
          success: function (res) {
            $("#o_list").html("");
            if (res.length > 0) {
              res.map((line, index) => {
                if (line.total > 0) {
                  let mon = index + 1;
                  let temp = document.querySelector("#o_temp");
                  let o_line = temp.content.cloneNode(true);
                  $(o_line).find("[rel=o_month]").text(mon);
                  $(o_line).find("[rel=o_ping]").text(line.ping);
                  $(o_line).find("[rel=o_ging]").text(line.ging);
                  $(o_line).find("[rel=o_ding]").text(line.ding);
                  $(o_line).find("[rel=o_ded]").text(line.ded);
                  $(o_line).find("[rel=o_ced]").text(line.ced);
                  $(o_line).find("[rel=o_total]").text(line.total);
                  $("#o_list").append(o_line);
                }
              });
            }
          },
          error: function (err) {
            console.error(err);
          },
        });
      }
    }
  });
  //#endregion

  //#region revenue
  $("input[name=r_type]").on("click", function () {
    r_typeChoosen = $(this).val();
    changeInput(r_typeChoosen, "r");
  });

  $("button[name=r_submit]").on("click", function () {
    if ($("input[name=r_type]:checked").length == 0) {
      $("[rel=r_err]").text("Chưa chọn kiểu thống kê");
      $("input[name=r_type]").focus();
    } else {
      $("[rel=r_err]").text("");
      let data = {
        year: $("input[name=r_year]").val(),
        month: $("input[name=r_month]").val(),
      };
      if (data.year == "" && data.month == "") {
        $("[rel=r_err]").text(
          `${r_typeChoosen == "number" ? "Năm" : "Tháng - năm"} là bắt buộc`
        );
      } else {
        $("[rel=r_err]").text("");
        $.ajax({
          type: "POST",
          url: "/orderM/statistic-revenue",
          data,
          success: function (res) {
            $("#r_list").html("");
            if (res.length > 0) {
              let temp = document.querySelector("#r_temp");
              let totalIncome = 0;
              let totalOutcome = 0;
              let totalRevenue = 0;
              res.map((line, index) => {
                if (
                  line.income != 0 ||
                  line.outcome != 0 ||
                  line.revenue != 0
                ) {
                  let mon = index + 1;
                  let r_line = temp.content.cloneNode(true);
                  $(r_line).find("[rel=r_month]").text(mon);
                  $(r_line)
                    .find("[rel=r_income]")
                    .text(formatCurrency(line.income));
                  $(r_line)
                    .find("[rel=r_outcome]")
                    .text(formatCurrency(line.outcome));
                  $(r_line)
                    .find("[rel=r_revenue]")
                    .text(formatCurrency(line.revenue));
                  totalIncome += line.income;
                  totalOutcome += line.outcome;
                  totalRevenue += line.revenue;
                  $("#r_list").append(r_line);
                }
              });
              let r_line = temp.content.cloneNode(true);
              $(r_line).find("tr").addClass("fw-bold");
              $(r_line).find("[rel=r_month]").addClass("text-end").text("Tổng");
              $(r_line)
                .find("[rel=r_income]")
                .text(formatCurrency(totalIncome));
              $(r_line)
                .find("[rel=r_outcome]")
                .text(formatCurrency(totalOutcome));
              $(r_line)
                .find("[rel=r_revenue]")
                .text(formatCurrency(totalRevenue));
              $("#r_list").append(r_line);
            }
          },
          error: function (err) {
            console.error(err);
          },
        });
      }
    }
  });
  //#endregion

  //#region material
  $("button[name=m_submit]").on("click", function () {
    let mMin = Number($("input[name=m_min]").val());
    let mMax = Number($("input[name=m_max]").val());
    if (mMin == "") $("[rel=m_err]").text("Số lượng nhỏ nhất là bắt buộc");
    else if (mMin < 0) $("[rel=m_err]").text("Số lượng nhỏ nhất không hợp lệ");
    else if (mMax == "") $("[rel=m_err]").text("Số lượng lớn nhất là bắt buộc");
    else if (mMax > Math.floor(mMax))
      $("[rel=m_err]").text("Số lượng lớn nhất không hợp lệ");
    else if (mMin > mMax)
      $("[rel=m_err]").text("Số lượng lớn nhất không hợp lệ");
    else {
      $("[rel=m_err]").text("");
      let data = {
        mMin,
        mMax,
      };
      $.ajax({
        type: "POST",
        url: "/material/statistic",
        data,
        success: function (res) {
          $("#m_list").html("");
          if (res.length > 0) {
            let temp = document.querySelector("#m_temp");
            res.map((line, index) => {
              let m_line = temp.content.cloneNode(true);
              $(m_line)
                .find("[rel=m_stt]")
                .text(index + 1);
              $(m_line)
                .find("[rel=m_img]")
                .attr("src", `img/materials/${line.mImg}`);
              $(m_line).find("[rel=m_name]").text(line.mName);
              $(m_line).find("[rel=m_unit]").text(line.mUnit);
              $(m_line).find("[rel=m_stock]").text(line.mStock);
              $(m_line).find("[rel=m_desc]").text(line.mDesc);
              $("#m_list").append(m_line);
            });
          }
        },
        error: function (err) {
          console.error(err);
        },
      });
    }
  });
  //#endregion

  //#region product
  $("button[name=p_submit]").on("click", function () {
    let pMin = Number($("input[name=p_min]").val());
    let pMax = Number($("input[name=p_max]").val());
    if (pMin == "") $("[rel=p_err]").text("Số lượng nhỏ nhất là bắt buộc");
    else if (pMin < 0) $("[rel=p_err]").text("Số lượng nhỏ nhất không hợp lệ");
    else if (pMax == "") $("[rel=p_err]").text("Số lượng lớn nhất là bắt buộc");
    else if (pMax > Math.floor(pMax))
      $("[rel=p_err]").text("Số lượng lớn nhất không hợp lệ");
    else if (pMin > pMax)
      $("[rel=p_err]").text("Số lượng lớn nhất không hợp lệ");
    else {
      $("[rel=p_err]").text("");
      let data = {
        pMin,
        pMax,
      };
      $.ajax({
        type: "POST",
        url: "/product/statistic",
        data,
        success: function (res) {
          $("#p_list").html("");
          if (res.length > 0) {
            let temp = document.querySelector("#p_temp");
            res.map((line, index) => {
              let p_line = temp.content.cloneNode(true);
              $(p_line)
                .find("[rel=p_stt]")
                .text(index + 1);
              $(p_line)
                .find("[rel=p_img]")
                .attr(
                  "src",
                  `img/products/${line.pImgs.find((pi) => pi.piIsMain).piImg}`
                );
              $(p_line).find("[rel=p_name]").text(line.pName);
              $(p_line).find("[rel=p_unit]").text(line.pUnit);
              let price = (
                line.pPrice -
                (line.pPrice * line.pDiscount) / 100
              ).toLocaleString("vi", { style: "currency", currency: "VND" });
              $(p_line).find("[rel=p_price]").text(price);
              $(p_line)
                .find("state")
                .addClass(`text-${line.pState ? "success" : "secondary"}`)
                .find("span")
                .data("feather", `eye${line.pState ? "" : "-off"}`);
              $(p_line).find("[rel=p_stock]").text(line.pStock);
              $("#p_list").append(p_line);
            });
            feather.replace({ "aria-hidden": "true" });
            $('[rel="tooltip"]').tooltip({ trigger: "hover" });
          }
        },
        error: function (err) {
          console.error(err);
        },
      });
    }
  });
  //#endregion
});
