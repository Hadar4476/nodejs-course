const getCookies = (cookie) => {
  return cookie.split(" ").reduce((acc, item) => {
    const [key, value] = item.split("=");

    let newValue = value.replace(/^'(.*)'$/, "$1");

    if (newValue === "true" || newValue === "false") {
      newValue = newValue === "true";
    }

    acc[key] = newValue; // Remove surrounding quotes if any

    return acc;
  }, {});
};

module.exports = getCookies;
