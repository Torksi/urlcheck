import getFlagEmoji from "../../util/flagEmoji";
import truncate from "../../util/truncate";

interface ComponentProps {
  id: string | string[] | undefined;
  redirectData: any[];
}

const RedirectsTable: React.FC<ComponentProps> = ({ id, redirectData }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Redirected from</th>
            <th scope="col" />
            <th scope="col">Redirected to</th>
            <th scope="col">IP</th>
            <th scope="col">Location</th>
          </tr>
        </thead>
        <tbody>
          {redirectData && redirectData.length === 0 && (
            <tr>
              <td className="text-center" colSpan={6}>
                No redirects found.
              </td>
            </tr>
          )}
          {redirectData &&
            redirectData.map((redirect: any) => {
              const url = redirect.urlTo.split("/");
              const restOfUrl = url.slice(0, url.length - 1).join("/");

              const urlFrom = redirect.urlFrom.split("/");
              const restOfUrlFrom = urlFrom.slice(0, url.length - 1).join("/");

              if (redirect.urlTo.length === 0) {
                return null;
              }

              return (
                <tr key={redirect.id}>
                  <td>{redirect.order}</td>
                  <td>
                    {redirect.failed && (
                      <i
                        title="Redirect failed"
                        className="bi bi-exclamation-triangle-fill text-danger me-3"
                      ></i>
                    )}
                    {truncate(urlFrom[urlFrom.length - 1] || "/", 60)}
                    <br />
                    <small>{restOfUrlFrom}</small>
                  </td>
                  <td>
                    <i className="bi bi-arrow-right text-info"></i>
                  </td>
                  <td>
                    {truncate(url[url.length - 1] || "/", 60)}
                    <br />
                    <small>{restOfUrl}</small>
                  </td>

                  <td>{redirect.geoIp}</td>
                  <td title={redirect.geoCountry}>
                    {getFlagEmoji(redirect.geoCountry)} {redirect.geoAs}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default RedirectsTable;
