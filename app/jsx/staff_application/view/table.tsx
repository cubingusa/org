import { useState } from "react";
import { useRouteLoaderData, Link } from "react-router-dom";

import { TraitComputer } from "../trait/api";
import { deserialize } from "../trait/deserialize";
import { ExportedRow } from "./types";

interface ViewTableParams {
  admin: boolean;
  computers: TraitComputer[];
  rows: ExportedRow[];
  updateSelectedIds: (ids: number[]) => void | null;
  deleteColumn: (id: string) => void | null;
}
export function ViewTable({
  admin,
  computers,
  rows,
  updateSelectedIds,
  deleteColumn,
}: ViewTableParams) {
  const [selectedIds, setSelectedIds] = useState([] as number[]);

  const onSelectAll = function (selected: boolean) {
    let newIds: number[];
    if (selected) {
      newIds = rows.map((row) => row.userId);
    } else {
      newIds = [];
    }
    setSelectedIds(newIds);
    if (updateSelectedIds) {
      updateSelectedIds(newIds);
    }
  };

  const onSelectPerson = function (selected: boolean, userId: number) {
    let newIds: number[];
    if (selected) {
      newIds = [...selectedIds, userId];
    } else {
      newIds = selectedIds.filter((a) => a != userId);
    }
    setSelectedIds(newIds);
    if (updateSelectedIds) {
      updateSelectedIds(newIds);
    }
  };

  return (
    <table className="table" style={{ overflowX: "auto" }}>
      <thead>
        <tr>
          {admin ? (
            <th scope="col">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="select-all"
                  checked={selectedIds.length == rows.length}
                  ref={(input) => {
                    if (!input) {
                      return;
                    }
                    if (
                      selectedIds.length > 0 &&
                      selectedIds.length < rows.length
                    ) {
                      input.indeterminate = true;
                    } else {
                      input.indeterminate = false;
                    }
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </div>
            </th>
          ) : null}
          <th scope="col">Name</th>
          {computers.map((column) => (
            <th key={column.id()} scope="col">
              <span
                className="material-symbols-outlined"
                onClick={(e) =>
                  deleteColumn !== null ? deleteColumn(column.id()) : null
                }
                style={{ cursor: "pointer" }}
              >
                delete
              </span>
              <br />
              {column.header()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.userId}>
            {admin ? (
              <td>
                <div className="form-check">
                  <input
                    className="form-check-input person-selector"
                    type="checkbox"
                    checked={selectedIds.includes(row.userId)}
                    onChange={(e) =>
                      onSelectPerson(e.target.checked, row.userId)
                    }
                  />
                </div>
              </td>
            ) : null}
            <td>
              {row.userName}&nbsp;
              {row.userWcaId ? (
                <>
                  (
                  <Link to={"https://wca.link/" + row.userWcaId}>
                    {row.userWcaId}
                  </Link>
                  )
                </>
              ) : null}
            </td>
            {computers.map((computer, idx) => (
              <td key={row.userId + "-" + computer.id()}>
                {deserialize(row.cells[idx], computer).render()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
