interface ErrorProps {
  description: string;
}

const ErrorScreen: React.FC<ErrorProps> = ({ description }) => {
  return (
    <div className="error-screen">
      <div className="alert alert-danger" role="alert">
        <strong>Error!</strong> {description}
      </div>
    </div>
  );
};

export default ErrorScreen;
