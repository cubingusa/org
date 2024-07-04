import { useState } from "react";
import { useRouteLoaderData, Link, useNavigate } from "react-router-dom";
import { Toast } from "react-bootstrap";

import { CompetitionData } from "../types/competition_data";
import { AdminHeader } from "../admin/header";

export function ReviewsIndex() {
  return <AdminHeader />;
}
