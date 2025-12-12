import { getStatusBadgeClasses } from "../../utils/helpers";


const StatusBadge = ({ status }) => {
  const classes = getStatusBadgeClasses(status);
  return (
    <span className={classes}>
      {status}
    </span>
  );
};

export default StatusBadge;