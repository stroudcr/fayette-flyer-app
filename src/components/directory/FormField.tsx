import type { ReactNode } from "react";

export const inputClass =
  "mt-1.5 block w-full rounded-md border border-navy/20 bg-white px-3.5 py-2.5 text-[15px] text-navy shadow-[0_1px_0_rgba(28,30,77,0.03)] outline-none transition placeholder:text-slate/50 focus:border-navy focus:ring-2 focus:ring-gold/40 aria-[invalid=true]:border-red-600";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label, hint and error around one input. The input should use `id` and aria-describedby={`${id}-help`}. */
export function FormField({ id, label, hint, error, optional, children, className = "" }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate/70">(optional)</span>}
      </label>
      {children}
      <p id={`${id}-help`} className={`mt-1.5 text-[13px] leading-5 ${error ? "font-medium text-red-700" : "text-slate/75"}`}>
        {error ?? hint}
      </p>
    </div>
  );
}
