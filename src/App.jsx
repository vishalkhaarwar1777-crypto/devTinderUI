import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";

import Body from "./component/Body";
import Login from "./component/Login";
import Signup from "./component/Signup";
import Feed from "./component/Feed";
import Profile from "./component/Profile";
import EditProfile from "./component/EditProfile";
import Connections from "./component/Connection";
import Requests from "./component/Requests";
import Chat from "./component/Chat";
import NotFound from "./component/NotFound";
import appStore from "./utils/appStore";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Feed />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="connections" element={<Connections />} />
            <Route
              path="connection"
              element={<Navigate to="/connections" replace />}
            />
            <Route path="requests" element={<Requests />} />
            <Route path="chat/:connectionId" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
