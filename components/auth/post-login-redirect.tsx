"use client";

import { useEffect } from "react";

export function PostLoginRedirect() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const auth = searchParams.get("auth");
    const postLogin = searchParams.get("postLogin");

    if (auth === "success" && postLogin === "1") {
      const redirectPath = sessionStorage.getItem("postLoginRedirect");

      if (redirectPath) {
        sessionStorage.removeItem("postLoginRedirect");
        window.location.replace(redirectPath);
      }
    }
  }, []);

  return null;
}


