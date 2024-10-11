const hasToken = (router: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    router.push("/setting");
  }
};

const hasNoToken = (router: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
  }
};

export { hasToken, hasNoToken };
