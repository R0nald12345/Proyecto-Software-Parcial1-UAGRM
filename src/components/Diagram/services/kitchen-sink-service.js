// Importación de librerías y módulos necesarios
import * as joint from "@joint/plus"; // Importa todo desde @joint/plus y lo asigna al alias joint
import * as appShapes from "../shapes/app-shapes"; // Importa todo desde el archivo app-shapes y lo asigna al alias appShapes
import { DirectedGraph } from "@joint/layout-directed-graph"; // Importa específicamente DirectedGraph desde @joint/layout-directed-graph

// Definición de la clase KitchenSinkService
class KitchenSinkService {
  // Constructor de la clase
  constructor(
    el, // Elemento del DOM
    stencilService, // Servicio de stencil
    toolbarService, // Servicio de barra de herramientas
    inspectorService, // Servicio de inspector
    haloService, // Servicio de halo (ayudas visuales y herramientas)
    keyboardService // Servicio de teclado
  ) {
    this.el = el; // Asigna el elemento del DOM a una variable de la instancia

    // Aplica el tema actual de JointJS
    const view = new joint.mvc.View({ el }); // Crea una nueva vista usando JointJS y le pasa el elemento del DOM
    view.delegateEvents({
      'mouseup input[type="range"]': (evt) => evt.target.blur(), // Elimina el foco de cualquier input[type="range"] cuando se suelta el ratón
    });

    // Asignación de servicios a variables de instancia
    this.stencilService = stencilService;
    this.toolbarService = toolbarService;
    this.inspectorService = inspectorService;
    this.haloService = haloService;
    this.keyboardService = keyboardService;
  }

  // Método para iniciar Rappid con las configuraciones y servicios necesarios
  startRappid() {
    joint.setTheme("modern"); // Configura el tema de JointJS como "modern"

    this.initializePaper(); // Inicializa el papel (lienzo)
    this.initializeStencil(); // Inicializa el stencil (componentes de ayuda)
    this.initializeSelection(); // Inicializa la selección de elementos
    this.initializeToolsAndInspector(); // Inicializa herramientas e inspector
    this.initializeNavigator(); // Inicializa el navegador
    this.initializeToolbar(); // Inicializa la barra de herramientas
    this.initializeKeyboardShortcuts(); // Inicializa atajos de teclado
    this.initializeTooltips(); // Inicializa tooltips (ayudas visuales emergentes)
  }

  // Método para detener y limpiar Rappid
  stopRappid() {
    this.paper.remove(); // Elimina el papel
    this.paperScroller.remove(); // Elimina el papel deslizante
    this.stencilService.stencil.remove(); // Elimina el stencil
    this.selection.remove(); // Elimina la selección
    this.toolbarService.toolbar.remove(); // Elimina la barra de herramientas
    this.keyboardService.keyboard.stopListening(); // Detiene la escucha de eventos del teclado
    this.tooltip.remove(); // Elimina los tooltips
  }

  // Método para inicializar el papel (lienzo)
  initializePaper() {
    const graph = (this.graph = new joint.dia.Graph(
      {},
      {
        cellNamespace: appShapes, // Usa las formas definidas en appShapes
      }
    ));

    // Gestión de comandos para deshacer/rehacer
    this.commandManager = new joint.dia.CommandManager({ graph: graph });

    // Configuración del papel
    const paper = (this.paper = new joint.dia.Paper({
      width: 1000,
      height: 1000,
      gridSize: 10,
      drawGrid: true,
      model: graph,
      cellViewNamespace: appShapes,
//------------------------------


      defaultLink: new appShapes.app.Link(), //Link Herencia
      // defaultLink: new appShapes.app.Aggregation(), //Link Aggregation
      // defaultLink: new appShapes.app.Association(), //Link Asociacion

      defaultConnectionPoint: appShapes.app.Link.connectionPoint,
      interactive: { 
          linkMove: false, 
          vertexAdd: true,
      },
      async: true,
      sorting: joint.dia.Paper.sorting.APPROX,
    }));

    // Añade eventos para menús contextuales (clic derecho)
    paper.on("blank:contextmenu", (evt) => {
      this.renderContextToolbar({ x: evt.clientX, y: evt.clientY });
    });

    paper.on("cell:contextmenu", (cellView, evt) => {
      this.renderContextToolbar({ x: evt.clientX, y: evt.clientY }, [
        cellView.model,
      ]);
    });

    // Añade líneas de ajustes para mejorar la alineación de elementos
    this.snaplines = new joint.ui.Snaplines({ paper: paper });

    // Configuración del papel deslizante
    const paperScroller = (this.paperScroller = new joint.ui.PaperScroller({
      paper,
      autoResizePaper: true,
      scrollWhileDragging: true,
      cursor: "grab",
    }));

    // Renderiza paperScroller en el contenedor especificado
    this.renderPlugin(".paper-container", paperScroller);
    paperScroller.render().center();

    // Añade eventos para el papel y el papel deslizante
    paper.on("paper:pan", (evt, tx, ty) => {
      evt.preventDefault();
      paperScroller.el.scrollLeft += tx;
      paperScroller.el.scrollTop += ty;
    });

    paper.on("paper:pinch", (evt, ox, oy, scale) => {
      // the default is already prevented
      const zoom = paperScroller.zoom();
      paperScroller.zoom(zoom * scale, {
        min: 0.2,
        max: 5,
        ox,
        oy,
        absolute: true,
      });
    });
  }

  // Inicializa el Stencil (panel de componentes)

  initializeStencil() {
    const { stencilService, paperScroller, snaplines } = this;

    // Crea el stencil y lo asocia con el paperScroller y las líneas de ajuste
    stencilService.create(paperScroller, snaplines);

    // Renderiza el stencil en el contenedor especificado
    this.renderPlugin(".stencil-container", stencilService.stencil);
    // Configura las formas en el stencil
    stencilService.setShapes();

     // Evento para capturar cuando se suelta un elemento en el lienzo
    stencilService.stencil.on("element:drop", (elementView) => {
       // Resetea la selección y añade el nuevo elemento
      this.selection.collection.reset([elementView.model]);
    });
  }

  // Inicializa la selección de elementos
  initializeSelection() {
    this.clipboard = new joint.ui.Clipboard(); // Inicializa el portapapeles
    this.selection = new joint.ui.Selection({
      paper: this.paperScroller, // Asocia el papel deslizante
      useModelGeometry: true,
      translateConnectedLinks:
        joint.ui.Selection.ConnectedLinksTranslation.SUBGRAPH,
    });

    // Añade eventos para gestionar cuando la selección cambia
    this.selection.collection.on(
      "reset add remove",
      this.onSelectionChange.bind(this)
    );

    const keyboard = this.keyboardService.keyboard;

    // Inicia la selección cuando se hace clic en un área en blanco del papel
    //mientras se mantiene presionada la tecla Shift.
    this.paper.on("blank:pointerdown", (evt, x, y) => {
      if (keyboard.isActive("shift", evt)) {
        this.selection.startSelecting(evt);
      } else {
        this.selection.collection.reset([]);
        this.paperScroller.startPanning(evt);
        this.paper.removeTools();
      }
    });

    // Inicia la selección cuando se hace clic en una celda mientras se mantiene presionada la tecla Shift.
    this.paper.on(
      "cell:pointerdown element:magnet:pointerdown",
      (cellView, evt) => {
        if (keyboard.isActive("shift", evt)) {
          cellView.preventDefaultInteraction(evt);
          this.selection.startSelecting(evt);
        }
      }
    );

    // Selecciona un elemento si la tecla CTRL/Meta está presionada mientras se hace clic en el elemento.
    this.paper.on("element:pointerdown", (elementView, evt) => {
      // Select an element if CTRL/Meta key is pressed while the element is clicked.
      if (keyboard.isActive("ctrl meta", evt)) {
        this.selection.collection.add(elementView.model);
      }
    });

    // Si un elemento se elimina del gráfico, se elimina también de la selección.
    this.graph.on("remove", (cell) => {
      // If element is removed from the graph, remove from the selection too.
      if (this.selection.collection.has(cell)) {
        this.selection.collection.reset(
          this.selection.collection.models.filter((c) => c !== cell)
        );
      }
    });

    // Añade eventos adicionales para gestionar la selección de elementos.
    this.selection.on(
      "selection-box:pointerdown",
      (elementView, evt) => {
        // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
        if (keyboard.isActive("ctrl meta", evt)) {
          this.selection.collection.remove(elementView.model);
        }
      },
      this
    );

    this.selection.on(
      "selection-box:pointerup",
      (elementView, evt) => {
        if (evt.button === 2) {
          evt.stopPropagation();
          this.renderContextToolbar(
            { x: evt.clientX, y: evt.clientY },
            this.selection.collection.toArray()
          );
        }
      },
      this
    );
  }

  // Método llamado cuando la selección cambia
  onSelectionChange() {
    const { paper, selection } = this;
    const { collection } = selection;
    paper.removeTools();
    joint.ui.Halo.clear(paper);
    joint.ui.FreeTransform.clear(paper);
    joint.ui.Inspector.close();
    if (collection.length === 1) {
      const primaryCell = collection.first();
      const primaryCellView = paper.findViewByModel(primaryCell);
      selection.destroySelectionBox(primaryCell);
      this.selectPrimaryCell(primaryCellView);
    } else if (collection.length === 2) {
      collection.each(function (cell) {
        selection.createSelectionBox(cell);
      });
    }
  }

  // Selecciona la celda primaria y aplica las herramientas apropiadas
  selectPrimaryCell(cellView) {
    const cell = cellView.model;
    if (cell.isElement()) {
      this.selectPrimaryElement(cellView);
    } else {
      this.selectPrimaryLink(cellView);
    }
    this.inspectorService.create(cell); // Crea un inspector para la celda primaria
  }

  // Aplica las herramientas a un elemento primario
  selectPrimaryElement(elementView) {
    const element = elementView.model;

    new joint.ui.FreeTransform({
      cellView: elementView,
      allowRotation: false,
      preserveAspectRatio: !!element.get("preserveAspectRatio"),
      allowOrthogonalResize: element.get("allowOrthogonalResize") !== false,
    }).render();

    //--------------------------------------------------------------------------------------------------------------------

    //I M P O R T A N T E     C O D I G O   P A R A   C O M P R E N D E R
    this.haloService.create(elementView); // Crea un halo alrededor del elemento
  }

  // Aplica las herramientas a un enlace primario
  selectPrimaryLink(linkView) {
    const ns = joint.linkTools;
    const toolsView = new joint.dia.ToolsView({
      name: "link-pointerdown",
      tools: [
        new ns.Vertices(), // Herramienta para manejar vértices
        new ns.SourceAnchor(), // Herramienta para el ancla de origen
        new ns.TargetAnchor(), // Herramienta para el ancla de destino
        new ns.SourceArrowhead(), // Herramienta para la flecha de origen
        new ns.TargetArrowhead(), // Herramienta para la flecha de destino
        new ns.Segments(), // Herramienta para manejar segmentos
        new ns.Boundary({ padding: 15 }), // Herramienta para el límite con margen
        new ns.Remove({ offset: -20, distance: 40 }), // Herramienta de eliminación de enlace
      ],
    });

    linkView.addTools(toolsView); // Añade las herramientas al enlace
  }

  // Initialice las herramientas y el inspector
  initializeToolsAndInspector() {
    // Evento para manejar cuando se suelta el clic en una celda
    this.paper.on("cell:pointerup", (cellView) => {
      const cell = cellView.model;
      const { collection } = this.selection;
      if (collection.includes(cell)) {
        return;
      }
      // Reinicia la colección con el nuevo elemento seleccionado
      collection.reset([cell]);
    });

    // Evento cuando el ratón entra en un enlace
    this.paper.on("link:mouseenter", (linkView) => {
      // Sólo abre la herramienta si no hay ninguna ya
      if (linkView.hasTools()) {
        return;
      }

      const ns = joint.linkTools;
      const toolsView = new joint.dia.ToolsView({
        name: "link-hover",
        tools: [
          new ns.Vertices({ vertexAdding: false }),
          new ns.SourceArrowhead(),
          new ns.TargetArrowhead(),
        ],
      });

      linkView.addTools(toolsView);
    });

    // Evento cuando el ratón sale de un enlace
    this.paper.on("link:mouseleave", (linkView) => {
      // Remueve sólo la herramienta de hover, no la de pointerdown
      if (linkView.hasTools("link-hover")) {
        linkView.removeTools();
      }
    });

    // Evento cuando hay cambios en el gráfico
    this.graph.on("change", (cell, opt) => {
      if (!cell.isLink() || !opt.inspector) {
        return;
      }

      const ns = joint.linkTools;
      const toolsView = new joint.dia.ToolsView({
        name: "link-inspected",
        tools: [new ns.Boundary({ padding: 15 })],
      });

      // Renderiza el navegador en el contenedor especificado
      cell.findView(this.paper).addTools(toolsView);
    });
  }

  // Inicializa el navegador
  initializeNavigator() {
    const navigator = (this.navigator = new joint.ui.Navigator({
      width: 240,
      height: 115,
      paperScroller: this.paperScroller,
      zoom: false,
      paperOptions: {
        async: true,
        sorting: joint.dia.Paper.sorting.NONE,
        elementView: appShapes.NavigatorElementView,
        linkView: appShapes.NavigatorLinkView,
        cellViewNamespace: {
          /* no other views are accessible in the navigator */
        },
      },
    }));

    this.renderPlugin(".navigator-container", navigator);
  }

  // Inicializa la barra de herramientas
  initializeToolbar() {
    // Crea la barra de herramientas con servicios necesarios
    this.toolbarService.create(this.commandManager, this.paperScroller);

    // Define eventos específicos para los botones de la barra de herramientas
    this.toolbarService.toolbar.on({
      "svg:pointerclick": this.openAsSVG.bind(this),
      "png:pointerclick": this.openAsPNG.bind(this),
      "to-front:pointerclick": this.applyOnSelection.bind(this, "toFront"),
      "to-back:pointerclick": this.applyOnSelection.bind(this, "toBack"),
      "layout:pointerclick": this.layoutDirectedGraph.bind(this),
      "snapline:change": this.changeSnapLines.bind(this),
      "clear:pointerclick": this.graph.clear.bind(this.graph),
      "print:pointerclick": () =>
        joint.format.print(this.paper, { grid: true }),
      "grid-size:change": this.paper.setGridSize.bind(this.paper),
    });

    // Renderiza la barra de herramientas en el contenedor especificado
    this.renderPlugin(".toolbar-container", this.toolbarService.toolbar);
  }

  // Renderiza la barra de herramientas contextual
  renderContextToolbar(point, cellsToCopy = []) {
    this.selection.collection.reset(cellsToCopy);
    const contextToolbar = new joint.ui.ContextToolbar({
      target: point,
      root: this.paper.el,
      padding: 0,
      vertical: true,
      anchor: "top-left",
      tools: [
        {
          action: "copy",
          content: "Copy",
          attrs: {
            disabled: cellsToCopy.length === 0,
          },
        },
        {
          action: "paste",
          content: "Paste",
          attrs: {
            disabled: this.clipboard.isEmpty(),
          },
        },
      ],
    });

    // Evento para copiar elementos seleccionados
    contextToolbar.on("action:copy", () => {
      contextToolbar.remove();

      this.clipboard.copyElements(cellsToCopy, this.graph);
    });

    // Evento para pegar elementos desde el portapapeles
    contextToolbar.on("action:paste", () => {
      contextToolbar.remove();
      const pastedCells = this.clipboard.pasteCellsAtPoint(
        this.graph,
        this.paper.clientToLocalPoint(point)
      );

      const elements = pastedCells.filter((cell) => cell.isElement());

      // Asegura que los elementos pegados se seleccionan inmediatamente
      this.selection.collection.reset(elements);
    });
    contextToolbar.render();
  }

  // Aplica una acción sobre la selección actual
  applyOnSelection(method) {
    this.graph.startBatch("selection");
    this.selection.collection.models.forEach(function (model) {
      model[method]();
    });
    this.graph.stopBatch("selection");
  }

  // Activa o desactiva las líneas de ajuste
  changeSnapLines(checked) {
    if (checked) {
      this.snaplines.enable();
    } else {
      this.snaplines.disable();
    }
  }

  // Inicializa los atajos de teclado
  initializeKeyboardShortcuts() {
    this.keyboardService.create(
      this.graph,
      this.clipboard,
      this.selection,
      this.paperScroller,
      this.commandManager
    );
  }

  // Inicializa los tooltips (ayudas visuales emergentes)
  initializeTooltips() {
    this.tooltip = new joint.ui.Tooltip({
      rootTarget: document.body,
      target: "[data-tooltip]",
      direction: joint.ui.Tooltip.TooltipArrowPosition.Auto,
      padding: 10,
    });
  }

  // Abre el lienzo como una imagen SVG
  openAsSVG() {
    this.paper.hideTools(); // Oculta las herramientas del papel
    joint.format.toSVG(
      this.paper, // Convierte el papel a SVG
      (svg) => {
        // Crea y abre un lightbox con la imagen SVG resultante
        new joint.ui.Lightbox({
          image: "data:image/svg+xml," + encodeURIComponent(svg),
          downloadable: true, // Permite descargar la imagen
          fileName: "Rappid", // Nombre predeterminado del archivo descargado
        }).open();
        this.paper.showTools(); // Muestra las herramientas del papel una vez que se ha generado la imagen
      },
      {
        preserveDimensions: true, // Preserva las dimensiones originales del papel
        convertImagesToDataUris: true, // Convierte las imágenes a Data URIs
        useComputedStyles: false, // No usa estilos calculados
        grid: true, // Incluye la cuadrícula en la exportación
      }
    );
  }

  // Abre el lienzo como una imagen PNG
  openAsPNG() {
    this.paper.hideTools(); // Oculta las herramientas del papel
    joint.format.toPNG(
      this.paper, // Convierte el papel a PNG
      (dataURL) => {
        // Crea y abre un lightbox con la imagen PNG resultante
        new joint.ui.Lightbox({
          image: dataURL,
          downloadable: true, // Permite descargar la imagen
          fileName: "Rappid", // Nombre predeterminado del archivo descargado
        }).open();
        this.paper.showTools(); // Muestra las herramientas del papel una vez que se ha generado la imagen
      },
      {
        padding: 10, // Padding alrededor del contenido convertido
        useComputedStyles: false, // No usa estilos calculados
        grid: true, // Incluye la cuadrícula en la exportación
      }
    );
  }
  // Organiza el gráfico usando el algoritmo de gráfico dirigido
  layoutDirectedGraph() {
    DirectedGraph.layout(this.graph, {
      setVertices: true, // Ajusta los vértices
      rankDir: "TB", // Dirección del rank de arriba a abajo (Top to Bottom)
      marginX: 100, // Margen horizontal
      marginY: 100, // Margen vertical
    });

    // Centra el contenido del papel usando la geometría del modelo
    this.paperScroller.centerContent({ useModelGeometry: true });
  }
  // Renderiza un plugin en el selector especificado
  renderPlugin(selector, plugin) {
    // Agrega el elemento del plugin al DOM
    this.el.querySelector(selector).appendChild(plugin.el);
    plugin.render(); // Renderiza el plugin
  }
}

export default KitchenSinkService;
