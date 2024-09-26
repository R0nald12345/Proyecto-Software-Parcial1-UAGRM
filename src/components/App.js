/*! JointJS+ v4.0.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2024 client IO

 2024-09-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { Component } from 'react';
import Diagram from './Diagram';

import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <Diagram title="JointJS+"/>
            </div>
        );
    }
}

export default App;
