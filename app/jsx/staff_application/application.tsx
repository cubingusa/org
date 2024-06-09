import Alert from "react-bootstrap/Alert";

import { useRouteLoaderData, useParams, Link } from "react-router-dom";

export function Application() {
  const { wcif, user } = useRouteLoaderData("competition");
  const { competitionId } = useParams();
  if (user === null) {
    return (
      <div>
        <h3>{wcif.name} Staff Application</h3>
        <Alert variant="primary">
          In order to apply to join our volunteer staff, you need to{" "}
          <a href="/login">log in with your WCA account</a>.
        </Alert>
      </div>
    );
  }
  let adminText;
  if (user.is_admin) {
    adminText = (
      <Alert variant="primary">
        You are an admin.{" "}
        <Link to="admin" relative="path">
          Visit the admin page.
        </Link>
      </Alert>
    );
  }
  return (
    <div>
      <h3>{wcif.name} Staff Application</h3>
      {adminText}
    </div>
  );
}
