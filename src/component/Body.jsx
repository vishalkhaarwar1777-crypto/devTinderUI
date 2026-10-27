
import axios from "axios";
import Navbar from "./Navbaar";
import { Outlet, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

function Body() {
   const dispatch=useDispatch();
   const navigate=useNavigate();
  const fetchUser=async ()=>{
   try{const res=await axios.get(BASE_URL+"/profile/view",
    {
      withCredentials:true
    });
    dispatch(addUser(res.data));
     
   } catch(err){
    if(err.status===401){
      navigate("/login")
    }
     console.error(err);
   }
  };
  useEffect(()=>{
    fetchUser();
  },[]);

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default Body;
