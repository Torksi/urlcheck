const MethodBadge = ({ method }: { method: string }) => {
  if (method === "GET") {
    return <span className="badge text-bg-info text-white badge-sm">GET</span>;
  } else if (method === "POST") {
    return <span className="badge text-bg-blue text-white badge-sm">POST</span>;
  } else if (method === "PUT") {
    return (
      <span className="badge text-bg-success text-white badge-sm">PUT</span>
    );
  } else if (method === "DELETE") {
    return (
      <span className="badge text-bg-danger text-white badge-sm">DELETE</span>
    );
  } else {
    return (
      <span className="badge text-bg-primary text-white badge-sm">Unknown</span>
    );
  }
};

export default MethodBadge;
