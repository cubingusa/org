import { useState } from "react";

import { Property } from "../types/property";

interface PropertyEditorProps {
  property: Property;
  deleteProperty: Function;
}

export function PropertyEditor(props: PropertyEditorProps) {
  const [name, setName] = useState(props.property.name || "");
  const [numValues, setNumValues] = useState(props.property.values.length);
  const property = props.property;
  const deleteProperty = props.deleteProperty;

  const updateName = function (name: string) {
    property.name = name;
    setName(name);
  };

  const newValue = function () {
    console.log(property);
    event.preventDefault();
    property.values.push({
      id: property.nextValueId,
      value: "New Value",
    });
    property.nextValueId++;
    setNumValues(property.values.length);
  };

  const deleteValue = function (id: number) {
    property.values = property.values.filter((v) => v.id !== id);
    setNumValues(property.values.length);
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
          {property.values.map((val) => (
            <li className="list-group-item" key={val.id + 1}>
              <input
                className="form-control"
                type="text"
                defaultValue={val.value}
                onChange={(e) => (val.value = e.target.value)}
                placeholder="Value of property"
              ></input>
              <span
                className="material-symbols-outlined"
                onClick={(e) => deleteValue(val.id)}
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
