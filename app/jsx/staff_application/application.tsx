import { useRouteLoaderData, useParams, Link } from "react-router-dom";

export function Application() {
  const { wcif, user, settings } = useRouteLoaderData("competition");
  const { competitionId } = useParams();
  let adminText;
  if (user.is_admin) {
    adminText = (
      <div className="alert alert-primary">
        You are logged in as an admin.{" "}
        <Link to="admin" relative="path">
          Visit the admin page.
        </Link>
      </div>
    );
  }

  let failure;
  if (!settings.isVisible) {
    failure = (
      <div className="alert alert-primary">
        Check back here soon for more information!
      </div>
    );
  } else if (user === null) {
    failure = (
      <div className="alert alert-primary">
        In order to apply to join our volunteer staff, you need to{" "}
        <a href="/login">log in with your WCA account</a>.
      </div>
    );
  }
  if (failure) {
    return (
      <div>
        <h3>{wcif.name} Staff Application</h3>
        {failure}
        {adminText}
      </div>
    );
  }
  return (
    <div>
      <h3>{wcif.name} Staff Application</h3>
      {adminText}
    </div>
  );
}
