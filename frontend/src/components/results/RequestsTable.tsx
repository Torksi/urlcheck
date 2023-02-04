import getFlagEmoji from "../../util/flagEmoji";
import truncate from "../../util/truncate";
import MethodBadge from "../MethodBadge";

interface ComponentProps {
  id: string | string[] | undefined;
  requestData: any[];
}

const RequestsTable: React.FC<ComponentProps> = ({ id, requestData }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">URL</th>
            <th scope="col">IP</th>
            <th scope="col">Location</th>
            <th scope="col">Method</th>
            <th scope="col">Status</th>
            <th scope="col">Type</th>
            <th scope="col">Size</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {requestData &&
            requestData.map((request: any) => {
              const url = request.requestUrl.split("/");
              const restOfUrl = url.slice(0, url.length - 1).join("/");

              return (
                <tr key={request.id}>
                  <td>{request.order}</td>
                  <td>
                    {request.failed && !restOfUrl.startsWith("data:") && (
                      <i
                        title="Request failed"
                        className="bi bi-exclamation-triangle-fill text-danger me-3"
                      ></i>
                    )}
                    {restOfUrl.startsWith("data:")
                      ? restOfUrl.split(",")[0]
                      : truncate(url[url.length - 1] || "/", 60)}
                    <br />
                    <small>
                      {restOfUrl.startsWith("data:") ? "truncated" : restOfUrl}
                    </small>
                  </td>
                  <td>{request.geoIp}</td>
                  <td title={request.geoCountry}>
                    {getFlagEmoji(request.geoCountry)} {request.geoAs}
                  </td>
                  <td>
                    <MethodBadge method={request.requestMethod} />
                  </td>
                  <td>{request.statusCode}</td>
                  <td>{request.responseType}</td>
                  <td>
                    {(
                      Math.round(
                        (parseFloat(request.responseSize) / 1024) * 100
                      ) / 100
                    ).toFixed(2)}{" "}
                    KB
                  </td>
                  <td>
                    <div className="btn-group float-end align-middle">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API}/api/web/${id}/request/${request.id}`}
                        target="_blank"
                        className="btn btn-info text-white btn-sm"
                        rel="noreferrer"
                        title="View request details"
                        aria-label="View request details"
                      >
                        <i className="bi-search"></i>
                      </a>
                      {request.responseBody &&
                        request.responseBody.length > 0 && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API}/api/web/${id}/request/${request.id}`}
                            target="_blank"
                            className="btn btn-primary btn-sm"
                            rel="noreferrer"
                            title="View response body"
                            aria-label="View response body"
                          >
                            <i className="bi-code"></i>
                          </a>
                        )}
                      {request.responseBody &&
                        request.responseBody.length > 0 &&
                        [
                          "application/javascript",
                          "application/x-javascript",
                          "text/javascript",
                          "text/html",
                        ].some((r) => request.responseType.startsWith(r)) && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API}/api/web/${id}/request/${request.id}/beautify`}
                            target="_blank"
                            className="btn btn-success btn-sm"
                            rel="noreferrer"
                            title="View beautified body"
                            aria-label="View beautified body"
                          >
                            <i className="bi-brush"></i>
                          </a>
                        )}
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

export default RequestsTable;
