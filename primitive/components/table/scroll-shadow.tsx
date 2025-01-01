type Props = {
  left: number;
  visible: boolean;
  height: number;
};
export function ScrollShadow(props: Props) {
  const { left, visible, height } = props;

  return visible ? (
    <div className="sticky top-0 w-12 pointer-events-none shadow-base z-2 " style={{ height, left }} />
  ) : null;
}

/**
 * background:
        linear-gradient(#fff, transparent 100%),
        linear-gradient(rgba(0, 0, 0, .5), transparent 100%);
    background-size: 100% 50px, 100% 10px;
    background-repeat: no-repeat;
    background-attachment: local, scroll;
 */
