type HeartProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

/** Soft, slightly rounded heart. Inherits colour via `currentColor`. */
export function Heart({ size = 24, ...props }: HeartProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21.2c-.3 0-.6-.1-.8-.3C6.6 17 3 13.9 3 9.6 3 6.9 5.1 4.8 7.7 4.8c1.6 0 3.2.8 4.3 2.1 1.1-1.3 2.7-2.1 4.3-2.1 2.6 0 4.7 2.1 4.7 4.8 0 4.3-3.6 7.4-8.2 11.3-.2.2-.5.3-.8.3Z" />
    </svg>
  );
}
