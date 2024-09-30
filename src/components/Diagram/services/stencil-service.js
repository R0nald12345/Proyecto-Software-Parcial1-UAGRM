/*! JointJS+ v4.0.1 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2024 client IO

 2024-09-10 


This Source Code Form is subject to the terms of the JointJS+ Trial License
, v. 2.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at https://www.jointjs.com/license
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


import { ui, dia } from '@joint/plus';
import * as appShapes from '../shapes/app-shapes';

export class StencilService {

    create(paperScroller, snaplines) {

        this.stencil = new ui.Stencil({
            paper: paperScroller,
            snaplines: snaplines,
            width: 240,
            groups: this.getStencilGroups(),
            dropAnimation: true,
            groupsToggleButtons: true,
            paperOptions: function() {
                return {
                    model: new dia.Graph({}, {
                        cellNamespace: appShapes
                    }),
                    cellViewNamespace: appShapes
                };
            },
            search: {
                '*': ['type', 'attrs/root/dataTooltip', 'attrs/label/text']
            },
            layout: {
                columns: 2,
                marginX: 10,
                marginY: 10,
                columnGap: 10,
                columnWidth: 100,
                rowHeight: 80,
            },
            // Remove tooltip definition from clone
            dragStartClone: (cell) => cell.clone().removeAttr('root/dataTooltip')
        });
    }

    
    setShapes() {
        this.stencil.load(this.getStencilShapes());
    }


    //cargo el Sidebar con las figuras el nombre
    getStencilGroups() {
        return {
            standard: { index: 1, label: 'Standard shapes' }
        };
    }


    //Atributos de las figuras en el Sidebar
    getStencilShapes() {
        return {
            standard: [
                {
                    type: 'standard.HeaderedRectangle',
                    size: { width: 95, height: 80 },
                    attrs: {
                        root: {
                            dataTooltip: 'Rectangle with header',
                            dataTooltipPosition: 'left',
                            dataTooltipPositionSelector: '.joint-stencil'
                        },
                        body: {
                            fill: 'transparent',
                            stroke: '#ea1313',
                            strokeWidth: 2,
                            strokeDasharray: '0'
                        },
                        header: {
                            stroke: '#ea1313',
                            fill: '#ea1313',
                            strokeWidth: 2,
                            strokeDasharray: '0',
                            height: 20
                        },
                        bodyText: {
                            textWrap: {
                                text: 'Atributes',
                                width: -10,
                                height: -20,
                                ellipsis: true
                            },
                            fill: '#f0000',
                            fontFamily: 'Roboto Condensed',
                            fontWeight: 'Normal',
                            fontSize: 12,
                            strokeWidth: 0,
                            y: 'calc(h/2 + 10)',
                        },
                        headerText: {
                            text: 'Nombre',
                            fill: '#f6f6f6',
                            fontFamily: 'Roboto Condensed',
                            fontWeight: 'Normal',
                            fontSize: 14,
                            strokeWidth: 0,
                            y: 10
                        }
                    }
                },
                {
                    type: 'app.Link', // Tipo definido en app-shapes.js
                    source: { x: 120, y: 0 },
                    target: { x: 230, y: 100 },
                    attrs: {
                        line: {
                            stroke: '#8f8f8f',
                            strokeWidth: 2,
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 10 -5 0 0 10 5 Z',
                                'fill': '#8f8f8f'
                            }
                        },
                        root: {
                            dataTooltip: 'Link Generalización',
                            dataTooltipPosition: 'left',
                            dataTooltipPositionSelector: '.joint-stencil'
                        }
                    }
                },
                {
                    type: 'app.Association', // Tipo definido en app-shapes.js
                    source: { x: 10, y: 100 },
                    target: { x: 100, y: 250 },
                    attrs: {
                        line: {
                            stroke: '#8f8f8f',
                            strokeWidth: 2,
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 10 -5 0 0 10 5 Z',
                                'fill': 'none'
                            }
                        },
                        root: {
                            dataTooltip: 'Link Asociación',
                            dataTooltipPosition: 'left',
                            dataTooltipPositionSelector: '.joint-stencil'
                        }
                    }
                },
                {
                    type: 'app.Composition', // Tipo definido en app-shapes.js
                    target: { x: 70, y: 100 },
                    source: { x: 163, y: 250 },
                    attrs: {
                        line: {
                            stroke: '#8f8f8f',
                            strokeWidth: 2,
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 10 -4 0 0 10 4 20 0 z',
                                'fill': '#8f8f8f'
                            }
                        },
                        root: {
                            dataTooltip: 'Link Composición',
                            dataTooltipPosition: 'left',
                            dataTooltipPositionSelector: '.joint-stencil'
                        }
                    }
                },
                {
                    type: 'app.Aggregation', // Tipo definido en app-shapes.js
                    target: { x: 120, y: 100 },
                    source: { x: 230, y: 250 },
                    attrs: {
                        line: {
                            stroke: '#8f8f8f',
                            strokeWidth: 2,
                            targetMarker: {
                                'type': 'path',
                                'd': 'M 10 -4 0 0 10 4 20 0 z',
                                'fill': 'none',
                                'stroke-width': 2,
                                'refX': -120,  // Ajusta la posición del cabezal a lo largo del eje X
                                'refY': 3  // Ajusta la posición del cabezal a lo largo del eje Y
                            }
                        },
                        root: {
                            dataTooltip: 'Link Agregación',
                            dataTooltipPosition: 'left',
                            dataTooltipPositionSelector: '.joint-stencil'
                        }
                    }
                }
            ]
        };
    }
}
