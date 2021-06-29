const errMessage = document.getElementById("errMessage");
const removeAlert = () => errMessage?.remove();
const toastElement = document.getElementById("toast");
if (toastElement) {
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}
