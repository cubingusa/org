import { useState } from "react";
import { useRouteLoaderData, Navigate, Link } from "react-router-dom";

export function Admin() {
  const [spinning, setSpinning] = useState(false);
  const { wcif, user, settings } = useRouteLoaderData("competition");

  const submit = async function () {
    setSpinning(true);
    await fetch(`/staff_api/${wcif.id}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSpinning(false);
  };

  if (user === null || !user.is_admin) {
    return <Navigate to="" />;
  }
  let spinner;
  if (spinning) {
    spinner = <div>submitting...</div>;
  }
  return (
    <div>
      <h3>{wcif.name} Staff Admin</h3>
      <div>
        You're viewing the admin settings. Return to the{" "}
        <Link to="..">public application</Link>.
      </div>
      <hr />
      <form>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="visible"
            defaultChecked={settings.isVisible}
            onChange={(e) => (settings.isVisible = e.target.checked)}
          />
          <label className="form-check-label" htmlFor="visible">
            Make staff application visible
          </label>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            value={settings.description}
            onChange={(e) => (settings.description = e.target.value)}
            placeholder="Text to show at the top of the application page"
          ></textarea>
        </div>
        <button className="btn btn-primary mb-3" type="submit" onClick={submit}>
          Submit
        </button>
        {spinner}
      </form>
    </div>
  );
}
