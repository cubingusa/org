import { ReviewsDataLoader } from "./loader";
import { ReviewsIndex } from "./index";

export function ReviewsRoutes() {
  return {
    path: "reviews",
    loader: ReviewsDataLoader,
    id: "reviews",
    element: <ReviewsIndex />,
  };
}
