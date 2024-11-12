import { useState, useEffect } from "react";

const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const updateSearchParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    Object.keys(params).forEach((key) => {
      newSearchParams.set(key, params[key]);
    });
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
    setSearchParams(newSearchParams);
  };

  return [searchParams, updateSearchParams] as const;
};

export default useSearchParams;
