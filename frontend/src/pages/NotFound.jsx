import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">

      <h1 className="text-6xl font-bold">
        404
      </h1>

      <p>Page Not Found</p>

      <Link
        to="/"
        className="bg-blue-600 px-6 py-2 rounded-lg"
      >
        Go Home
      </Link>

    </div>
  );
}

export default NotFound;