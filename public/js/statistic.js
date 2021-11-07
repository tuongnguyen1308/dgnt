$(document).ready(() => {
  const curPage = "product";
  let o_typeChoosen, r_typeChoosen;

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
              res.map((line, index) => {
                if (line.total > 0) {
                  let mon = index + 1;
                  let temp = document.querySelector("#r_temp");
                  let r_line = temp.content.cloneNode(true);
                  $(r_line).find("[rel=r_month]").text(mon);
                  $(r_line).find("[rel=r_ping]").text(line.ping);
                  $(r_line).find("[rel=r_ging]").text(line.ging);
                  $(r_line).find("[rel=r_ding]").text(line.ding);
                  $(r_line).find("[rel=r_ded]").text(line.ded);
                  $(r_line).find("[rel=r_ced]").text(line.ced);
                  $(r_line).find("[rel=r_total]").text(line.total);
                  $("#r_list").append(o_line);
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
});
