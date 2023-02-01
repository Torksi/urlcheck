import dynamicSort from "../../util/dynamicSort";
import truncate from "../../util/truncate";
import SuspicionBadge from "../SuspicionBadge";

interface ComponentProps {
  id: string | string[] | undefined;
  alertData: any[];
}

const AlertsTable: React.FC<ComponentProps> = ({ id, alertData }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">URL</th>
            <th scope="col">Description</th>
            <th scope="col">Method</th>
            <th scope="col">Priority</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {alertData &&
            alertData
              .sort(dynamicSort("foundAt"))
              .map((alert: any, index: number) => {
                const url = alert.url.split("/");
                const restOfUrl = url.slice(0, url.length - 1).join("/");

                return (
                  <tr key={alert.id}>
                    <td>
                      {alert.fullyDeobfuscated && (
                        <i
                          title="Fully deobfuscated"
                          className="bi bi-patch-check text-info me-2"
                        ></i>
                      )}
                      {truncate(url[url.length - 1] || "/", 60)}
                      <br />
                      <small>{restOfUrl}</small>
                    </td>
                    <td>{alert.description}</td>
                    <td>{alert.method}</td>
                    <td>
                      <SuspicionBadge lvl={alert.suspicionLevel} />
                    </td>
                    <td>
                      <div className="btn-group float-end align-middle">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API}/api/webscan/${id}/alert/${alert.id}`}
                          target="_blank"
                          className="btn btn-danger text-white btn-sm"
                          rel="noreferrer"
                          title="View alert details"
                          aria-label="View alert details"
                        >
                          <i className="bi-search"></i>
                        </a>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API}/api/webscan/${id}/request/${alert.webScanRequestId}/beautify`}
                          target="_blank"
                          className="btn btn-info text-white btn-sm"
                          rel="noreferrer"
                          title="View requested file"
                          aria-label="View requested file"
                        >
                          <i className="bi-code"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsTable;
