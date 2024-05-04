import React, { useEffect, useRef } from "react";
import ClassicDocRoot from "@theme-init/DocRoot";
import { Page } from "genji-runtime";
import { useLocation } from "@docusaurus/router";

function useDark() {
  const [dark, setDark] = React.useState(false);
  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          setDark(mutation.target.getAttribute("data-theme") === "dark");
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  return dark;
}

export default function DocRoot(props) {
  const pageRef = useRef(null);
  const location = useLocation();
  const dark = useDark();

  useEffect(() => {
    const config = window.__genjiConfig || {};
    if (!pageRef.current) pageRef.current = new Page(config);
    pageRef.current.render();
    return () => pageRef.current.dispose();
  }, [location.pathname]);

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.emit("dark", dark);
    }
  }, [dark]);

  return <ClassicDocRoot {...props} />;
}
