import clsx from "clsx";

interface Props {
  fillClassName?: string;
  className?: string;
}

export function Spin(props: Props) {
  return (
    <div
      className={clsx(
        "origin-center animate-spin w-fit h-fit leading-[0] text-size-24",
        props.className
      )}
    >
      <span
        className={clsx(
          "inline-block w-[1em] h-[1em] [&_svg]:h-[1em] [&_svg]:w-[1em] leading-none"
        )}
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M12 2C6.4767 2 2 6.4767 2 12C2 17.5233 6.4767 22 12 22C17.5233 22 22 17.5233 22 12C22 6.4767 17.5233 2 12 2ZM12 19.7796C7.70304 19.7796 4.22035 16.297 4.22035 11.9997C4.22035 7.70278 7.70304 4.22009 12 4.22009C16.2972 4.22009 19.7802 7.70278 19.7802 11.9997C19.7799 16.2972 16.2972 19.7796 12 19.7796Z'
            className='fill-brand-10'
          />
          <path
            d='M12 2V4.22015C16.2971 4.22015 19.78 7.70293 19.78 12H22C21.9997 6.47682 17.5232 2 12 2Z'
            className={clsx("fill-brand", props.fillClassName)}
          />
        </svg>
      </span>
    </div>
  );
}
