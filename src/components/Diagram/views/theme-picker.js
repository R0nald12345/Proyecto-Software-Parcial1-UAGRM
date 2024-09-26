/*! JointJS+ v4.0.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2024 client IO

 2024-09-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import * as joint from '@joint/plus';

import '../css/style.modern.css';
import '../css/style.dark.css';
import '../css/style.material.css';

export class ThemePicker extends joint.ui.Toolbar {

    constructor(options) {

        super({
            ...options,
            className: `${joint.ui.Toolbar.prototype.className} theme-picker`
        });

        this.mainView = options.mainView;
    }

    init() {

        const options = [
            { value: 'modern', content: 'Modern' },
            { value: 'dark', content: 'Dark' },
            { value: 'material', content: 'Material' }
        ];

        const themes = {
            type: 'select-button-group',
            name: 'theme-picker',
            multi: false,
            selected: options.findIndex(option => option.value === this.defaultTheme),
            options,
            attrs: {
                '.joint-select-button-group': {
                    'data-tooltip': 'Change Theme',
                    'data-tooltip-position': 'bottom'
                }
            }
        };

        this.options.tools = [themes];
        this.on('theme-picker:option:select', this.onThemeSelected, this);

        super.init();
    }

    onThemeSelected(option) {

        joint.setTheme(option.value);
        if (this.mainView) {
            this.adjustAppToTheme(this.mainView, option.value);
        }
    }

    adjustAppToTheme(app, theme) {

        // Material design has no grid shown.
        if (theme === 'material') {
            app.paper.options.drawGrid = false;
            app.paper.setGrid(null);
        } else {
            app.paper.options.drawGrid = true;
            app.paper.setGrid(true);
        }
    }
}
