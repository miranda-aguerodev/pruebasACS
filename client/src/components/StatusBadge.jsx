import { formatStatus } from "../helpers/formatters";

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {formatStatus(status)}
    </span>
  );
}