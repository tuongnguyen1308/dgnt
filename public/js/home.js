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
  //#endregion
});
