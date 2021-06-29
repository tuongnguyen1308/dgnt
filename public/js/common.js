$(document).ready(function () {
  const toastElement = document.getElementById("toast");
  if (toastElement) {
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
  feather.replace({ "aria-hidden": "true" });
});
