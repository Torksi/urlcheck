import Link from "next/link";
import { LoadingSpinner } from "./LoadingSpinner";

export default function LoadingScan() {
  return (
    <div className="loading-screen">
      <LoadingSpinner />
      <p>
        Hold on while we scan the website. This process is automatic and may
        take up to 2 minutes. You will automatically be redirected once the scan
        is finished. <strong>Do not refresh this page.</strong>
      </p>
    </div>
  );
}
