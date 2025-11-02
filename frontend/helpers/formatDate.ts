export function formatDate(input?: string | number | Date | null) {
    if (!input) return "";
    const d = new Date(input as any);
    if (isNaN(d.getTime())) return String(input);

    const now = Date.now();
    const diff = now - d.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "just now";
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

    const showYear = d.getFullYear() !== new Date().getFullYear();
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    };
    if (showYear) (options as any).year = "numeric";

    return d.toLocaleString(undefined, options as any);
}

export default formatDate;
