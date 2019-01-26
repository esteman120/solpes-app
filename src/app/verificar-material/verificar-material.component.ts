import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { SPServicio } from "../servicios/sp-servicio";
import { CondicionContractual } from "../dominio/condicionContractual";
import { CondicionesTecnicasBienes } from "../verificar-material/condicionTecnicaBienes";
import { responsableProceso } from '../dominio/responsableProceso';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from "@angular/router";
import { ToastrManager } from "ng6-toastr-notifications";
import { ItemAddResult } from "sp-pnp-js";
import { CondicionTecnicaServicios } from "../verificar-material/condicionTecnicaServicios";
import { BsModalService, BsModalRef } from "ngx-bootstrap";
import { verificarMaterialCT } from "./verificarMaterialCT";
import { MatTableDataSource, MatPaginator} from '@angular/material';
import { parse } from 'url';


@Component({
  selector: "app-verificar-material",
  templateUrl: "./verificar-material.component.html",
  styleUrls: ["./verificar-material.component.css"]
})
export class VerificarMaterialComponent implements OnInit {
  @ViewChild('cantidad') cantidad: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  panelOpenState = false;
  titleVerificar = "VERIFICAR MATERIAL";
  ObjSolicitud: any;
  condicionesContractuales: CondicionContractual[] = [];
  fechaDeseada: Date;
  tipoSolicitud: string;
  solicitante: string;
  verificarMaterialFormulario: FormGroup;
  verificarSubmitted = false;
  codAriba: string;
  emptyVerificar: boolean;
  ordenadorGasto: string;
  empresa: string;
  pais: string;
  numOrdenEstadistica: string;
  categoria: string;
  subCategoria: string;
  comprador: string;
  justificacion: string;
  alcance: string;
  ObjCondicionesContractuales: any;
  IdSolicitud: any;
  loading: boolean;
  ComentarioSondeo: string;
  ComentarioVerificarMaterial: string;
  ObjCondicionesTecnicas: CondicionesTecnicasBienes[] = [];
  ObjCondicionesTecnicasServicios: CondicionTecnicaServicios[] = [];
  ObjCTVerificar: verificarMaterialCT[] = [];
  AgregarElementoForm: FormGroup;
  ObjResponsableProceso: responsableProceso[] = [];
  submitted = false;
  dataSource;
  labelPosition = "after";
  displayedColumns: string[] = [
    "codigo",
    "descripcion",
    "modelo",
    "fabricante",
    "cantidad",
    "existenciasverificar",
    "numreservaverificar",
    "cantidadreservaverificar",
    "Accion"
  ];
  modalRef: BsModalRef;
  IdVerficar: any;
  paisId: any;
  IdResponsable: any;
  IdSolicitudParms: string;
  cantidadTotalCompra: number;
  OrdenEstadistica: boolean;
  SwtichOrdenEstadistica: boolean;
  ArchivoAdjunto: File;
  SwtichFaltaRecepcionBienes: boolean;

  constructor(
    private servicio: SPServicio,
    private formBuilder: FormBuilder,
    private modalServicio: BsModalService,
    public toastr: ToastrManager,
    private router: Router
  ) {
    this.loading = false;
    this.emptyVerificar = true;
    this.ArchivoAdjunto = null;
    this.SwtichOrdenEstadistica=false;
    this.cantidadTotalCompra = 0;
    this.IdSolicitudParms = sessionStorage.getItem("IdSolicitud");
  }

  adjuntarArchivoVM(event) {
    let archivoAdjunto = event.target.files[0];
    if (archivoAdjunto != null) {
      this.ArchivoAdjunto = archivoAdjunto;
    } else {
      this.ArchivoAdjunto = null;
    }
  }
  comfirmasalir(template: TemplateRef<any>) {
    this.modalRef = this.modalServicio.show(template, { class: 'modal-lg' });
  }
  declinarModal() {
    this.modalRef.hide();
  }
  GuardarComentario() {  
    let coment;   
    let comentarios = this.ComentarioVerificarMaterial;
      if(this.SwtichOrdenEstadistica === true){
        if (this.ArchivoAdjunto === null) {
            this.mostrarAdvertencia("Por favor ingrese el documento de registro de activos")
            return false;
        }
        let ResponsableProcesoId = this.ObjResponsableProceso[0].porRegistrarActivos; 
        coment = {
          Estado: 'Por registrar activos',
          ResponsableId: ResponsableProcesoId,
          ComentarioVerificarMaterial: comentarios,
          FaltaRecepcionBienes: this.SwtichFaltaRecepcionBienes 
        }
    }else{      
      let ResponsableProcesoId = this.ObjResponsableProceso[0].porRegistrarSolp; 
      coment = {
        Estado: 'Por registrar solp sap',
        ResponsableId: ResponsableProcesoId,
        ComentarioVerificarMaterial: comentarios,
        FaltaRecepcionBienes: this.SwtichFaltaRecepcionBienes 
      }
    }
      let cantidad = this.ObjCTVerificar.filter(x => x.MaterialVerificado === true).length;
      let cantidadMateriales = this.ObjCTVerificar.length;
      if (cantidad === cantidadMateriales) {
        this.servicio.guardarComentario(this.IdSolicitud, coment)
          .then((resultado: ItemAddResult) => {
        this.MostrarExitoso("Materiales verificados correctamente");
        if(this.SwtichOrdenEstadistica === true){
          let nombreArchivo = "ActivoVM-" + this.generarllaveSoporte() + "_" + this.ArchivoAdjunto.name;
          this.servicio.agregarAdjuntoActivos(this.IdSolicitud,nombreArchivo,this.ArchivoAdjunto).then(
            (respuesta)=>{
                this.MostrarExitoso("Archivo guardado correctamente");
                this.router.navigate(["/mis-pendientes"]);
            }
          ).catch(
            (error)=>{
                this.mostrarError("Error al guardar el archivo");
            }
          );
        } 
        else {
          this.router.navigate(["/mis-pendientes"]);
        }       
        

          })
          .catch(error => {
            console.log(error);
          });
      }else{
        this.mostrarError("Faltan materiales por verificar");
        }
      
  }

  MostrarExitoso(mensaje: string) {
    this.toastr.successToastr(mensaje, "Confirmación!");
  }

  mostrarError(mensaje: string) {
    this.toastr.errorToastr(mensaje, "Oops!");
  }

  mostrarAdvertencia(mensaje: string) {
    this.toastr.warningToastr(mensaje, "Validación");
  }

  mostrarInformacion(mensaje: string) {
    this.toastr.infoToastr(mensaje, "Información importante");
  }

  generarllaveSoporte(): string {
    var fecha = new Date();
    var valorprimitivo = fecha.valueOf().toString();
    return valorprimitivo;
  }

  ngOnInit() {
    this.loading = true;
    this.RegistrarFormularioVerificar();
    this.ValidarNumReservaSiHayExistencias();

    this.servicio
      .ObtenerSolicitudBienesServicios(this.IdSolicitudParms)
      .subscribe(solicitud => {
        this.IdSolicitud = solicitud.Id;
        this.fechaDeseada = solicitud.FechaDeseadaEntrega;
        this.tipoSolicitud = solicitud.TipoSolicitud;
        this.solicitante = solicitud.Solicitante;
        this.ordenadorGasto = solicitud.OrdenadorGastos.Title;
        this.empresa = solicitud.Empresa.Title;
        this.codAriba = solicitud.CodigoAriba;
        this.pais = solicitud.Pais.Title;
        this.paisId = solicitud.Pais.Id;
        this.numOrdenEstadistica = solicitud.NumeroOrdenEstadistica;
        this.OrdenEstadistica = solicitud.OrdenEstadistica;
        this.categoria = solicitud.Categoria;
        this.subCategoria = solicitud.Subcategoria;
        this.comprador = solicitud.Comprador.Title;
        this.alcance = solicitud.Alcance;
        this.justificacion = solicitud.Justificacion;
        this.ComentarioSondeo = solicitud.ComentarioSondeo;

        if(solicitud.CondicionesContractuales != null){
          this.condicionesContractuales = JSON.parse(solicitud.CondicionesContractuales).condiciones;
        }
        
        this.servicio
          .ObtenerCondicionesTecnicasBienes(this.IdSolicitud)
          .subscribe(RespuestaCondiciones => {
            this.ObjCondicionesTecnicas = CondicionesTecnicasBienes.fromJsonList(
              RespuestaCondiciones
              );
              
          console.log(this.ObjCondicionesTecnicas);
          
            this.ObjCTVerificar = verificarMaterialCT.fromJsonList(
              RespuestaCondiciones
            );
            this.dataSource = new MatTableDataSource(this.ObjCTVerificar);
            this.dataSource.paginator = this.paginator;
            this.servicio
            .obtenerResponsableProcesos(this.paisId) 
            .subscribe(RespuestaResponsableProceso => {
              this.ObjResponsableProceso = responsableProceso.fromJsonList(
                RespuestaResponsableProceso
              );
            });
          });
        this.servicio
          .ObtenerCondicionesTecnicasServicios(this.IdSolicitud)
          .subscribe(RespuestaCondicionesServicios => {
            this.ObjCondicionesTecnicasServicios = CondicionTecnicaServicios.fromJsonList(
              RespuestaCondicionesServicios
            );
            console.log(this.ObjCondicionesTecnicasServicios);
            this.loading = false;
          });
      });
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  salir() {
    this.modalRef.hide();
    this.router.navigate(["/mis-solicitudes"]);
  }

  // IdSolicitudParms(IdSolicitudParms: any): any {
  //   throw new Error("Method not implemented.");
  // }

  RegistrarFormularioVerificar() {
    this.verificarMaterialFormulario = new FormGroup({
      codigoVerificar: new FormControl("", Validators.required),
      descripcionVerificar: new FormControl("", Validators.required),
      modeloVerificar: new FormControl("", Validators.required),
      fabricanteVerificar: new FormControl("", Validators.required),
      cantidadVerificar: new FormControl("0", Validators.required),
      existenciasVerificar: new FormControl("0"),
      numReservaVerificar: new FormControl(""),
      cantidadReservaVerificar: new FormControl("0"),
    });
    console.log('Fomulario creado');
  }

  ValidarNumReservaSiHayExistencias() {
    const numReservaVerificar = this.verificarMaterialFormulario.get('numReservaVerificar');
    this.verificarMaterialFormulario.get('existenciasVerificar').valueChanges.subscribe(
      (valor: string) => {
        if (valor != ''|| valor != undefined || valor != null ) {
          if (parseFloat(valor) > 0) {
            numReservaVerificar.setValidators([Validators.required]);
          }
          else {
            numReservaVerificar.clearValidators();
          }
        }
        else {
          numReservaVerificar.clearValidators();
        }
        numReservaVerificar.updateValueAndValidity();
      });

  }

  abrirModalVerificarMaterial(template: TemplateRef<any>, element) {
    console.log(element);
    this.verificarSubmitted = false;
    this.IdVerficar = element.id;
   
      this.verificarMaterialFormulario.controls["codigoVerificar"].setValue(element.codigoSondeo);
    
    this.verificarMaterialFormulario.controls["descripcionVerificar"].setValue(
      element.descripcion
    );
    this.verificarMaterialFormulario.controls["modeloVerificar"].setValue(
      element.modelo
    );
    this.verificarMaterialFormulario.controls["fabricanteVerificar"].setValue(
      element.fabricante
    );
    this.verificarMaterialFormulario.controls["cantidadVerificar"].setValue(
      element.cantidad
    );
    this.verificarMaterialFormulario.controls["existenciasVerificar"].setValue(
      element.existenciasverificar
    );
    this.verificarMaterialFormulario.controls["numReservaVerificar"].setValue(
      element.numreservaverificar
    );
    if(element.cantidadreservaverificar === null || element.cantidadreservaverificar === undefined ){
      this.verificarMaterialFormulario.controls["cantidadReservaVerificar"].setValue(
        element.cantidad
      );
    }else{
      this.verificarMaterialFormulario.controls["cantidadReservaVerificar"].setValue(
        element.cantidadreservaverificar
      );
    }

    this.modalRef = this.modalServicio.show(
      template,
      Object.assign({}, { class: "gray modal-lg" })
    );
    this.verificarMaterialFormulario.get('existenciasVerificar').setValidators([ValidarMayorExistencias(element.cantidad)]);
  }

  VerificarOnSubmit() {
    this.verificarSubmitted = true;
    if (this.verificarMaterialFormulario.invalid) {
      return;
    }
    let objGuardarVerificar;
    let codigoVerificar = this.verificarMaterialFormulario.controls[
      "codigoVerificar"
    ].value;
    let descripcionVerificar = this.verificarMaterialFormulario.controls[
      "descripcionVerificar"
    ].value;
    let modeloVerificar = this.verificarMaterialFormulario.controls[
      "modeloVerificar"
    ].value;
    let fabricanteVerificar = this.verificarMaterialFormulario.controls[
      "fabricanteVerificar"
    ].value;
    let cantidadverificar = this.verificarMaterialFormulario.controls[
      "cantidadVerificar"
    ].value;
    let existenciasverificar = this.verificarMaterialFormulario.controls[
      "existenciasVerificar"
    ].value;
    let numreservaverificar = this.verificarMaterialFormulario.controls[
      "numReservaVerificar"
    ].value;
    let cantidadreservaverificar = this.verificarMaterialFormulario.controls[
      "cantidadReservaVerificar"
    ].value;

    let index = this.ObjCTVerificar.findIndex(x => x.id === this.IdVerficar);
    this.ObjCTVerificar[index].codigoSondeo = codigoVerificar;
    this.ObjCTVerificar[index].descripcion = descripcionVerificar;
    this.ObjCTVerificar[index].cantidadverificar = cantidadverificar;
    this.ObjCTVerificar[index].existenciasverificar = existenciasverificar;
    this.ObjCTVerificar[index].numreservaverificar = numreservaverificar;
    this.ObjCTVerificar[index].cantidadreservaverificar = cantidadreservaverificar;
    this.ObjCTVerificar[index].MaterialVerificado = true;

    let sum = this.ObjCTVerificar.map(item => item.cantidadreservaverificar).reduce((prev, next) => prev + next);

    objGuardarVerificar = {
      CodigoVerificar: codigoVerificar,
      DescripcionVerificar: descripcionVerificar,
      ModeloVerificar: modeloVerificar,
      FabricanteVerificar: fabricanteVerificar,
      CantidadVerificar: cantidadverificar,
      ExistenciasVerificar: existenciasverificar,
      NumReservaVerificar: numreservaverificar,
      CantidadReservaVerificar: cantidadreservaverificar,
      MaterialVerificado: true
    }

    // subirAdjuntoCA(event) {
    //   this.ObjCondicionesTecnicas = new CondicionesTecnicasBienes(null, '', null, '', '', '', '', null, null, '', event.target.files[0], '', '');
    // }

    this.servicio.guardarVerificarMaterial(this.IdVerficar, objGuardarVerificar)
      .then((resultado: ItemAddResult) => {
        this.mostrarInformacion("Material verificado correctamente");
        this.cantidadTotalCompra =  this.cantidadTotalCompra + cantidadreservaverificar;
        if (sum > 0 && this.OrdenEstadistica === true) {
          this.SwtichOrdenEstadistica = true;
        }
        else{
          this.SwtichOrdenEstadistica = false;
        }
        if(sum === 0){
          this.SwtichFaltaRecepcionBienes = false;
        }
        else{
          this.SwtichFaltaRecepcionBienes = true;
        }
      })
      .catch(error => {
        console.log(error);
      });
    this.dataSource = this.ObjCTVerificar;
    this.CargarTablaVerificar();
    this.limpiarControlesVerificar();    
    this.modalRef.hide();
  }


  RestaCantidadReserva() {
    let Existencia: number = this.verificarMaterialFormulario.controls[
      "existenciasVerificar"
    ].value;
    let Cantidad: number = this.verificarMaterialFormulario.controls[
      "cantidadVerificar"
    ].value;

    if (Existencia > Cantidad) {
      this.verificarMaterialFormulario.controls[
        "cantidadReservaVerificar"
      ].setValue(0);
    } else {
      let operacion: number = Cantidad - Existencia;
      this.verificarMaterialFormulario.controls[
        "cantidadReservaVerificar"
      ].setValue(operacion);
    }
  }

  private CargarTablaVerificar() {
    this.dataSource.data = this.ObjCondicionesTecnicas;
    this.emptyVerificar = false;
  }

  limpiarControlesVerificar(): any {
    this.verificarMaterialFormulario.reset();
  }

  get f() {
    return this.verificarMaterialFormulario.controls;
  }
}


export function ValidarMayorExistencias(valor): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    return control.value <= valor ? null : {
      cantidadMenor: {
        valid: false
      }
    }
  };
}