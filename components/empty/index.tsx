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
      <h1 className='text-size-14 leading-5 font-medium text-text2'>{title}</h1>
      <p className='text-size-12 leading-4 text-text2'>{subTitle}</p>
      {action && <div className='flex items-center gap-16 mt-16'>{action}</div>}
    </section>
  );
}
