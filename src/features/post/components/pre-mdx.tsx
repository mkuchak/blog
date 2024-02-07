import { BrightProps, Code } from "bright";
import { Fragment, PropsWithChildren } from "react";

export function PreMDX({ children, ...props }: PropsWithChildren<BrightProps>) {
  return (
    <Code
      {...props}
      className="[&>pre]:!bg-slate-50 dark:[&>pre]:!bg-zinc-900 drop-shadow"
      theme={{
        dark: "github-dark",
        light: "github-light",
      }}
      lineNumbers={props.lineNumbers ?? true}
    >
      <Fragment>{children}</Fragment>
    </Code>
  );
}
