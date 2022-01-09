import React from 'react';
import {Navbar} from "reactstrap";

const NavigationBar = () => {
    return (
        <Navbar dark container="fluid" style={{backgroundColor: "#052"}}>
            <div className="col-12 text-center barbed-wire-image">
                <div className="text-light mx-2 mt-4 fw-bold" style={{fontSize: "25px"}}>BORDER PATROL APP</div>
            </div>
        </Navbar>
    );
}

export default NavigationBar;