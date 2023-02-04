import dynamicSort from "../../util/dynamicSort";
import truncate from "../../util/truncate";
import SuspicionBadge from "../SuspicionBadge";

interface ComponentProps {
  scanData: any;
}

const GlobalVariablesTable: React.FC<ComponentProps> = ({ scanData }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(scanData.globalVariables).map((v) => {
            return (
              <tr key={`global-var-${v}`}>
                <td>{v}</td>
                <td>
                  <pre>
                    <code>{scanData.globalVariables[v]}</code>
                  </pre>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GlobalVariablesTable;
