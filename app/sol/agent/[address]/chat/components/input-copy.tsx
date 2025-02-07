import { Input } from "./ui/input";

export default function InputCopy({
  title,
  value,
}: {
  title: string;
  value: string | number | undefined;
}) {
  return (
    <div className='space-y-2'>
      <span>{title}</span>
      <Input value={value} readOnly />
    </div>
  );
}
