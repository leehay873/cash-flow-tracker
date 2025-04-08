import React from "react";
import Home from "../container/Home";
import { Route , Routes } from "react-router-dom";

const Index=()=>{
    return(
        <Routes>
            <Route path="/" element={<Home/>}/>
        </Routes>
    )
}
export default Index;