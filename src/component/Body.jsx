
import Navbar from "./Navbaar";
import { Outlet } from "react-router-dom";

function Body() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default Body;
