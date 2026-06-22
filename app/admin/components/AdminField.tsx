interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
}

export function AdminInput({
  label,
  name,
  required,
  type = "text",
  defaultValue,
  placeholder,
}: FieldProps & { type?: string; defaultValue?: string | number; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-gray-600">
        {label} {required && <span className="text-[#c7092b]">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
      />
    </label>
  );
}

export function AdminSelect({
  label,
  name,
  required,
  defaultValue,
  children,
}: FieldProps & { defaultValue?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-gray-600">
        {label} {required && <span className="text-[#c7092b]">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
      >
        {children}
      </select>
    </label>
  );
}

export function AdminTextarea({
  label,
  name,
  required,
  defaultValue,
  rows = 4,
  placeholder,
}: FieldProps & { defaultValue?: string; rows?: number; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-gray-600">
        {label} {required && <span className="text-[#c7092b]">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none"
      />
    </label>
  );
}
