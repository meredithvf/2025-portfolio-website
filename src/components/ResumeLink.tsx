import type { AnchorHTMLAttributes, ReactNode } from "react";

export const RESUME_URL = "/resume.pdf";
export const RESUME_DOWNLOAD_FILENAME = "meredith-von-feldt-resume.pdf";

interface ResumeLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "download"> {
  children: ReactNode;
  datadogActionName?: string;
}

export default function ResumeLink({
  children,
  datadogActionName,
  ...props
}: ResumeLinkProps) {
  return (
    <a
      href={RESUME_URL}
      download={RESUME_DOWNLOAD_FILENAME}
      datadog-action-name={datadogActionName}
      {...props}
    >
      {children}
    </a>
  );
}
