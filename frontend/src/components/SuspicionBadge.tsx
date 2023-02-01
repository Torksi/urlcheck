const SuspicionBadge = ({ lvl }: { lvl: number }) => {
  if (lvl === 0) {
    return <span className="badge text-bg-primary badge-sm">Info</span>;
  } else if (lvl === 1) {
    return <span className="badge text-bg-blue badge-sm">Low</span>;
  } else if (lvl === 2) {
    return (
      <span className="badge text-bg-info text-white badge-sm">Medium</span>
    );
  } else if (lvl === 3) {
    return <span className="badge text-bg-danger badge-sm">High</span>;
  } else {
    return <span className="badge text-bg-primary badge-sm">Unknown</span>;
  }
};

export default SuspicionBadge;
