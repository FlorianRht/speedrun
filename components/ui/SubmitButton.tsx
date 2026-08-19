"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "./Spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
};

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger:
    "inline-flex items-center justify-center rounded-xl bg-red-500 text-white font-medium px-5 py-2.5 hover:bg-red-600 transition text-sm disabled:opacity-50 min-h-[44px]",
};

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || disabled}
      className={`${variants[variant]} gap-2 ${className}`}
    >
      {pending && <Spinner size="sm" />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}
