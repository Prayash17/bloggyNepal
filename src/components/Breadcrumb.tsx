import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
}: {
  items: Crumb[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-slate-600"
    >
      <ol className="flex flex-wrap items-center gap-y-1">
        {items.map(
          (item, index) => {
            const isLast =
              index ===
              items.length - 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center"
              >
                {item.href &&
                !isLast ? (
                  <Link
                    href={item.href}
                    className="rounded-md px-1 py-0.5 underline-offset-4 transition hover:text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={
                      isLast
                        ? "page"
                        : undefined
                    }
                    className={
                      isLast
                        ? "px-1 font-medium text-slate-900"
                        : "px-1"
                    }
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="px-1 text-slate-400"
                  >
                    /
                  </span>
                )}
              </li>
            );
          }
        )}
      </ol>
    </nav>
  );
}