type MotionMarqueeProps<T> = {
  items: T[];
  ariaLabel: string;
  className?: string;
  getKey: (item: T) => string;
  renderItem: (item: T, index: number, duplicate: boolean) => React.ReactNode;
};

export function MotionMarquee<T>({
  items,
  ariaLabel,
  className = "",
  getKey,
  renderItem,
}: MotionMarqueeProps<T>) {
  const indexedItems = items.map((item, index) => ({ item, index }));
  const rows = [
    indexedItems.filter((_, index) => index % 2 === 0),
    indexedItems.filter((_, index) => index % 2 === 1),
  ];

  return (
    <div
      className={`motion-gallery ${className}`.trim()}
      role="region"
      aria-label={ariaLabel}
    >
      {rows.map((row, rowIndex) => (
        <div className={`motion-row${rowIndex === 1 ? " is-reverse" : ""}`} key={rowIndex}>
          <div className="motion-track">
            {[false, true].map((duplicate) => (
              <div
                className="motion-sequence"
                aria-hidden={duplicate ? true : undefined}
                key={duplicate ? "duplicate" : "primary"}
              >
                {row.map(({ item, index }) => (
                  <div className="motion-entry" key={`${getKey(item)}-${duplicate ? "copy" : "main"}`}>
                    {renderItem(item, index, duplicate)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
