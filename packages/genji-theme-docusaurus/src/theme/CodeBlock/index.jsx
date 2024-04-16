import React from "react";
import ClassicCodeBlock from "@theme-init/CodeBlock";
import { parseMeta } from "genji-runtime/node";

export default function CodeBlock(props) {
  const { metastring = "" } = props;
  const attrs = parseMeta(metastring);
  if (!attrs) return <ClassicCodeBlock {...props} />;
  const { code, inspector } = attrs;
  return (
    <>
      <div
        className="genji-cell"
        data-options={metastring}
        style={{ display: inspector === "false" ? "none" : undefined }}
      ></div>
      {code === "false" ? (
        <div style={{ display: "none" }}>
          <ClassicCodeBlock {...props} />
        </div>
      ) : (
        <ClassicCodeBlock {...props} />
      )}
    </>
  );
}
