import React, { useEffect, useRef } from "react";
import ClassicDocRoot from "@theme-init/DocRoot";
import { Page } from "genji-runtime";
import { useLocation } from "@docusaurus/router";

export default function DocRoot(props) {
  const pageRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const config = window.__genjiConfig || {};
    if (!pageRef.current) pageRef.current = new Page(config);
    pageRef.current.render();
    return () => pageRef.current.dispose();
  }, [location.pathname]);

  return <ClassicDocRoot {...props} />;
}
