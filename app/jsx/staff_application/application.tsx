import { useRouteLoaderData, useParams } from "react-router-dom";

export function Application() {
  const { wcif, user } = useRouteLoaderData("competition");
  const { competitionId } = useParams();
  let adminText;
  if (user.is_admin) {
    adminText = <div>You are an admin</div>;
  }
  return (
    <div>
      <h4>{wcif.name} Staff Application</h4>
      {adminText}
    </div>
  );
}
