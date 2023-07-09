import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import Movies from "./components/Movies/Movies";
import AddMovie from "./components/Movies/AddMovie";
import EditMovie from "./components/Movies/EditMovie";
import Login from "./components/Login/Login";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from 'react'
import { adminActions, userActions } from './store'
import Booking from "./components/Bookings/Booking";
import TopupForm from "./components/Topup/TopupForm";
import Profile from "./components/Profile/Profile";

function App() {
  const dispatch = useDispatch()
  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn)
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn)
  console.log("isAdminLoggedIn", isAdminLoggedIn)
  console.log("isUserLoggedIn", isUserLoggedIn)
  useEffect(() => {
    if(localStorage.getItem("userId")) {
      dispatch(userActions.login())
    } else if(localStorage.getItem("adminId")) {
      dispatch(adminActions.login())
    }
  }, [])
  return (
    <div>
      <Header />
      <section>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/movies" element={<Movies />} />
          {!isUserLoggedIn && !isAdminLoggedIn && (<><Route path="/login" element={<Login />} /></>)}
          {isUserLoggedIn && !isAdminLoggedIn && (<><Route path="/booking/:id" element={<Booking />} />
          <Route path="/user" element={<Profile/>} />
          <Route path="/topup" element={<TopupForm />}/></>)}
          {isAdminLoggedIn && !isUserLoggedIn && (<><Route path="/add" element={<AddMovie />}/>
          <Route path="/edit/:id" element={<EditMovie />}/></>)}
        </Routes>
      </section>
    </div>
  );
}

export default App;
