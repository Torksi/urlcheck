import Link from "next/link";
import dynamicSort from "../../util/dynamicSort";
import truncate from "../../util/truncate";

interface ComponentProps {
  id: string | string[] | undefined;
  linkData: any[];
}

const LinksTable: React.FC<ComponentProps> = ({ id, linkData }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Source</th>
            <th scope="col">Target</th>
            <th scope="col">Type</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {linkData &&
            linkData
              .sort(dynamicSort("target"))
              .map((link: any, index: number) => {
                const url = link.url.split("/");
                const restOfUrl = url.slice(0, url.length - 1).join("/");

                return (
                  <tr key={link.id}>
                    <td>
                      {truncate(url[url.length - 1] || "/", 60)}
                      <br />
                      <small>{restOfUrl}</small>
                    </td>
                    <td>{link.target}</td>
                    <td>{link.type}</td>
                    <td>
                      <div className="btn-group float-end align-middle">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API}/api/web/${id}/request/${link.requestId}`}
                          target="_blank"
                          className="btn btn-info text-white btn-sm"
                          rel="noreferrer"
                          title="View source file"
                          aria-label="View source file"
                        >
                          <i className="bi-code"></i>
                        </a>
                        <Link
                          href={`/web/scan?url=${
                            link.target.startsWith(".") ||
                            link.target.startsWith("/") ||
                            link.target.startsWith("#")
                              ? link.url
                              : ""
                          }${link.target}`}
                          target="_blank"
                          className="btn btn-success text-white btn-sm"
                          rel="noreferrer"
                          title="Scan URL"
                          aria-label="Scan URL"
                        >
                          <i className="bi-search"></i>
                        </Link>
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

export default LinksTable;
