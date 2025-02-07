import { Input } from "./ui/input";

export default function ArrayInput({
  title,
  data,
}: {
  title: string;
  data: string[];
}) {
  return (
    <div className='space-y-2'>
      <span>{title}</span>
      <div className='p-2 bg-card rounded-md border'>
        <div className='space-y-2'>
          {data?.map((b: string, idx: number) => (
            <Input value={b} key={idx} className='bg-background' />
          ))}
        </div>
      </div>
    </div>
  );
}
