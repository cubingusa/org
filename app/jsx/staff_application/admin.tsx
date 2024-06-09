import { useRouteLoaderData, Navigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export function Admin() {
  const { wcif, user } = useRouteLoaderData("competition");
  if (user === null || !user.is_admin) {
    return <Navigate to="" />;
  }
  return (
    <div>
      <h3>{wcif.name} Staff Admin</h3>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Make staff application visible" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Text to show at the top of the application page"
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}
