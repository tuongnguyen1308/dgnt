$(document).ready(() => {
  $inpQuan = $("[name=cdQuantity]");
  //#region func
  const changeQuantity = (num) => {
    $inpQuan.val(Number($inpQuan.val()) + Number(num));
  };
  $("[rel=sub-quantity]").on("click", function () {
    if (Number($inpQuan.val()) > 0) changeQuantity(-1);
  });
  $("[rel=add-quantity]").on("click", function () {
    console.log(Number($inpQuan.val()));
    if (Number($inpQuan.val()) < $inpQuan.attr("max")) changeQuantity(1);
  });
  $inpQuan.on("keydown", function (e) {
    if (!/^[0-9]$/i.test(e.key) && e.key != "Backspace") {
      console.log(e.key);
      e.preventDefault();
      e.stopPropagation();
    }
  });
  if ($(".desc")) {
    $(".desc").parent().html($(".desc").data("desc"));
  }
  //#endregion
});
