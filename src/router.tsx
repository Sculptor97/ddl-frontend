import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { TripPlannerPage } from "./pages/TripPlannerPage";

const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<TripPlannerPage />} />
))

export default router;