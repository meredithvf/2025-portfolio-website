import Link from "next/link";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  className?: string;
  variant?: "inverted" | "subtle";
}

export default function Button({
  children,
  href,
  onClick,
  target,
  rel,
  className = "",
  variant = "inverted",
}: ButtonProps) {
  const baseStyles =
    "px-6 py-3 text-xl bg-foreground text-background border-foreground hover:bg-foreground/5 hover:text-foreground hover:border-foreground inline-block border rounded-sm transition-all duration-300 hover:translate-x-2 hover:scale-110 origin-left";

  const combinedClassName = `${baseStyles} ${className}`;

  if (href) {
    // External link
    if (href.startsWith("http") || href.startsWith("//")) {
      return (
        <a
          href={href}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          className={combinedClassName}
        >
          {children}
        </a>
      );
    }
    // Internal link
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  // Button
  return (
    <button onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
}
