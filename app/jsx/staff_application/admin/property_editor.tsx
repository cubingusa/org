import { useState } from "react";

import { Property } from "../types/property";

interface PropertyEditorProps {
  property: Property;
  deleteProperty: Function;
}

export function PropertyEditor(props: PropertyEditorProps) {
  const [name, setName] = useState(props.property.name || "");
  const [numValues, setNumValues] = useState(props.property.values.size);
  const property = props.property;
  const deleteProperty = props.deleteProperty;

  const updateName = function (name: string) {
    property.name = name;
    setName(name);
  };

  const newValue = function () {
    event.preventDefault();
    property.values.set(property.nextValueId, "New Value");
    property.nextValueId++;
    setNumValues(property.values.size);
  };

  const deleteValue = function (id: number) {
    property.values.delete(id);
    setNumValues(property.values.size);
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor={"description-" + property.id} className="form-label">
            Name
          </label>
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="Name of property"
          ></input>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={"visible-" + property.id}
            defaultChecked={property.visible}
            onChange={(e) => (property.visible = e.target.checked)}
          />
          <label
            className="form-check-label"
            htmlFor={"visible-" + property.id}
          >
            Make this property visible to staff
          </label>
        </div>
        <div>Values</div>
        <ul className="list-group">
          {Array.from(property.values).map(([id, value]) => (
            <li className="list-group-item" key={id + 1}>
              <input
                className="form-control"
                type="text"
                defaultValue={value}
                onChange={(e) => property.values.set(id, e.target.value)}
                placeholder="Value of property"
              ></input>
              <span
                className="material-symbols-outlined"
                onClick={(e) => deleteValue(id)}
                style={{ cursor: "pointer" }}
              >
                delete
              </span>
            </li>
          ))}
          <li className="list-group-item" key="new">
            <button className="btn btn-success mb-3" onClick={newValue}>
              <span className="material-symbols-outlined">add</span> Add Value
            </button>
          </li>
        </ul>
        <button
          type="button"
          className="btn btn-danger"
          onClick={(e) => deleteProperty(property)}
        >
          <span className="material-symbols-outlined">delete</span> Delete
          Property
        </button>
      </div>
    </div>
  );
}
