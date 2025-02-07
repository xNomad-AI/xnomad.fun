import clsx from "clsx";
import Image from "next/image";

type Props = {
  className?: string;
  title?: string;
  subTitle?: string | React.ReactNode;
  action?: React.ReactNode;
};

export function Empty(props: Props) {
  const { className, title = "Empty", subTitle, action } = props;

  return (
    <section
      className={clsx(
        "flex flex-col items-center justify-center gap-8",
        className
      )}
    >
      <Image
        src={"/logo.svg"}
        width={100}
        height={100}
        alt='empty'
        className='w-[6.25rem] aspect-square select-none'
      />
      <h1 className='text-size-14 leading-5 font-medium'>{title}</h1>
      <p className='text-size-12 leading-4 text-text-secondary'>{subTitle}</p>
      {action && <div className='flex items-center gap-16 mt-16'>{action}</div>}
    </section>
  );
}
