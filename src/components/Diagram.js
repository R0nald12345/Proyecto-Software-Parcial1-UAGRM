
 import React, { Component } from 'react'; 
 import { setTheme } from '@joint/plus'; 
 import { collection, getDocs } from "firebase/firestore"; // Importar la función y db
 import { db } from "../firebase/config"; // Asegúrate de que la ruta es correcta
 
 import { StencilService } from './Diagram/services/stencil-service'; 
 import { ToolbarService } from './Diagram/services/toolbar-service'; 
 import { InspectorService } from './Diagram/services/inspector-service'; 
 import { HaloService } from './Diagram/services/halo-service'; 
 import { KeyboardService } from './Diagram/services/keyboard-service'; 
 import RappidService from './Diagram/services/kitchen-sink-service'; 
 
 import { ThemePicker } from './Diagram/views/theme-picker'; 
 import { sampleGraphs } from './Diagram/config/sample-graphs'; 
 
 import './Diagram/css/style.css'; 
 import './Diagram/css/theme-picker.css'; 
 
 class Diagram extends Component { 
 
     constructor(props) { 
         super(props); 
         this.appRef = React.createRef(); 
         this.themePickerRef = React.createRef(); 
     } 
 
     async componentDidMount() { 
 
         setTheme('modern'); 
 
         const service = new RappidService( 
             this.appRef.current, 
             new StencilService(), 
             new ToolbarService(), 
             new InspectorService(), 
             new HaloService(), 
             new KeyboardService() 
         ); 
         this.rappid = service; 
         service.startRappid(); 
         service.graph.fromJSON(JSON.parse(sampleGraphs.emergencyProcedure)); 
 
         const themePicker = new ThemePicker({ 
             el: this.themePickerRef.current, 
             mainView: service 
         }); 
         themePicker.render(); 
         this.themePicker = themePicker; 
 
         // Agrega aquí el test de conexión a Firestore
         const testConnection = async () => {
             try {
                 const querySnapshot = await getDocs(collection(db, "graph")); // Asegúrate de la colección "graph" existe
                 querySnapshot.forEach((doc) => {
                     console.log(`${doc.id} => ${doc.data()}`);
                 });
             } catch (error) {
                 console.error("Error connecting to Firestore: ", error);
             }
         };
 
         testConnection();
     } 
 
     componentWillUnmount() { 
         this.rappid.stopRappid(); 
         this.themePicker.remove(); 
     } 
 
     render() { 
         return ( 
             <div ref={this.appRef} className="Diagram"> 
                 <div className="app-header"> 
                     <div className="app-title"> 
                         <h1>{this.props.title}</h1> 
                     </div> 
                     <div className="toolbar-container" /> 
                 </div> 
                 <div className="app-body"> 
                     <div className="stencil-container" /> 
                     <div className="paper-container" /> 
                     <div className="inspector-container" /> 
                     <div className="navigator-container" /> 
                 </div> 
                 <div ref={this.themePickerRef} className="theme-picker"></div> 
             </div> 
         ); 
     } 
 } 
 
 export default Diagram;