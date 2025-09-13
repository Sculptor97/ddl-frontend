import router from "./router";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
   <RouterProvider router={router} />
   <Toaster />
   </>
  )
}

export default App;