
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./component/Body";
import Login from "./component/login";
import Signup from "./component/Signup";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Body />}>
          <Route
            index
            element={<h1 className="p-10 text-3xl">DevTinder Home</h1>}
          />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </Provider>
  );
}

export default App;
