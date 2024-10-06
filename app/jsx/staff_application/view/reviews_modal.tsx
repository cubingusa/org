import { DateTime } from "luxon";
import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Toast } from "react-bootstrap";
import { ApplicantData } from "../types/applicant_data";
import { CompetitionData } from "../types/competition_data";
import { createFilter } from "../filter/create_filter";

interface ReviewsModalParams {
  id: string;
  personIds: number[];
  allApplicants: ApplicantData[];
}

export function ReviewsModal({
  id,
  personIds,
  allApplicants,
}: ReviewsModalParams) {
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [formId, setFormId] = useState(
    settings.reviewForms.length == 0 ? 0 : settings.reviewForms[0].id,
  );
  const reviewForm = settings.reviewForms.find((f) => f.id == formId);
  const [action, setAction] = useState("auto");
  const [selectedReviewerId, setSelectedReviewerId] = useState(-1);
  const [deadlineSeconds, setDeadlineSeconds] = useState(0);
  const [failureToast, setFailureToast] = useState(false);

  let disabledSubmit =
    settings.reviewForms.length == 0 || reviewForm == undefined;

  const formSection =
    settings.reviewForms.length > 0 ? (
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label htmlFor="form-selector" className="form-label">
            Form
          </label>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            id="form-selector"
            value={formId}
            onChange={(e) => setFormId(+e.target.value)}
          >
            {settings.reviewForms.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    ) : (
      <>You haven't created any review forms for this competition.</>
    );

  const actionSection =
    reviewForm !== undefined ? (
      <div>
        <select
          className="form-select"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="auto">Auto-assign reviewers</option>
          <option value="manual">Manually assign reviewers</option>
        </select>
      </div>
    ) : null;

  let manualSection;
  let eligibleReviewers = allApplicants;
  if (action == "manual" && reviewForm !== undefined) {
    const filters = reviewForm.eligibleReviewerFilters.map((params) =>
      createFilter(params, settings, wcif),
    );
    eligibleReviewers = allApplicants.filter((applicant) => {
      for (const filter of filters) {
        if (!filter.apply(applicant)) {
          return false;
        }
      }
      return true;
    });
    if (
      !eligibleReviewers.map((r) => +r.user.id).includes(selectedReviewerId)
    ) {
      disabledSubmit = true;
    }
    manualSection = (
      <div>
        <select
          className="form-select"
          value={selectedReviewerId}
          onChange={(e) => setSelectedReviewerId(+e.target.value)}
        >
          <option value={-1}></option>
          {eligibleReviewers.map((r) => (
            <option value={r.user.id} key={r.user.id}>
              {r.user.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  let deadlineSection;
  if (reviewForm !== undefined) {
    deadlineSection = (
      <div className="mb-3 row">
        <label htmlFor="deadline" className="col-2 col-form-label">
          Deadline
        </label>
        <div className="col-10">
          <input
            type="datetime-local"
            className="form-control"
            id="deadline"
            defaultValue=""
            onChange={(e) => {
              setDeadlineSeconds(DateTime.fromISO(e.target.value).toSeconds());
            }}
          />
        </div>
      </div>
    );
  }

  const doSubmit = async function () {
    const body = {
      reviewFormId: formId,
      users: personIds.map((personId) => {
        let reviewerIds = [] as number[];
        const applicant = allApplicants.find((a) => a.user.id == personId);
        if (applicant == undefined) {
          return null;
        }
        if (action == "auto") {
          for (const defaultReviews of reviewForm.defaults) {
            let applies = true;
            for (const params of defaultReviews.filters) {
              if (!createFilter(params, settings, wcif).apply(applicant)) {
                applies = false;
                break;
              }
            }
            if (applies) {
              for (const reviewerId of defaultReviews.personIds) {
                reviewerIds.push(reviewerId);
              }
            }
          }
        } else if (action == "manual") {
          reviewerIds = [selectedReviewerId];
        }
        return {
          id: personId,
          reviewerIds,
        };
      }),
      deadlineSeconds: deadlineSeconds,
    };
    try {
      await fetch(`/staff_api/${wcif.id}/review/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      window.location.reload();
    } catch (e) {
      setFailureToast(true);
      setTimeout(() => setFailureToast(false), 10000);
    }
  };

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Edit Applicants</h1>
          </div>
          <div className="modal-body">
            {formSection}
            {actionSection}
            {manualSection}
            {deadlineSection}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              data-bs-dismiss="modal"
              onClick={doSubmit}
              disabled={disabledSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <Toast
        show={failureToast}
        className="position-fixed bottom-0 end-0 p-3 bg-danger-subtle"
      >
        <Toast.Body>Error submitting!</Toast.Body>
      </Toast>
    </div>
  );
}
