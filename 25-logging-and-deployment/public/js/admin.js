const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[name=csrfToken]").value;

  const productElement = btn.closest("article");

  console.log({ productId });
  console.log({ csrfToken });

  fetch(`/admin/delete-product/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    // make sure to add this app.use(express.json()); to app.js
    body: JSON.stringify({
      csrfToken, // Replace with the data you want to send
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log({ data });

      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
};
