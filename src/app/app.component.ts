import { Component, OnInit, Compiler } from '@angular/core';
import * as $ from 'jquery';
import { SPServicio } from './servicios/sp-servicio';
import { Usuario } from './dominio/usuario';
import { Grupo } from './dominio/grupo';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  usuario: Usuario;
  nombreUsuario: string;
  grupos: Grupo[] = [];
  PermisosEdicionContratos: boolean;
  PermisosRegistroEntradasBienes: boolean;
  PermisosRegistroEntradasServicios: boolean;
  PermisosConsultaGeneral: boolean;
  linkEdicionContratos: string;

  constructor(private servicio: SPServicio, private compilador: Compiler) {
    this.compilador.clearCache();
    this.PermisosEdicionContratos = false;
    this.PermisosRegistroEntradasBienes = false;
    this.PermisosRegistroEntradasServicios = false;
    this.PermisosConsultaGeneral = false;
    this.linkEdicionContratos = environment.urlWeb + environment.linkVistaEdicionContratos;
  }

  abrirCerrarMenu() {
    $(document).ready(function () {
      $("#menu-toggle").click(function (e) {
        let textoMenu = e.target.innerText;
        let nuevoTextoMenu = "";
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        if (textoMenu == "Ocultar menú") {
          nuevoTextoMenu = "Mostrar menú";
          e.target.innerText = nuevoTextoMenu;
        } else {
          nuevoTextoMenu = "Ocultar menú";
          e.target.innerText = nuevoTextoMenu;
        }
      });
    });
  }

  ObtenerUsuarioActual() {
    this.servicio.ObtenerUsuarioActual().subscribe(
      (respuesta) => {
        this.usuario = new Usuario(respuesta.Title, respuesta.email, respuesta.Id);
        this.nombreUsuario = this.usuario.nombre;
        sessionStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.servicio.ObtenerGruposUsuario(this.usuario.id).subscribe(
          (respuesta) => {
            this.grupos = Grupo.fromJsonList(respuesta);
            this.VerificarPermisosMenu();
          }, err => {
            console.log('Error obteniendo grupos de usuario: ' + err);
          }
        )
      }, err => {
        console.log('Error obteniendo usuario: ' + err);
      }
    )
  }

  VerificarPermisosMenu(): any {

    const grupoEdicionContratos = "Solpes-Edicion-Contratos";
    const grupoRegistroEntradasBienes = "Solpes-Registro-Entradas-Bienes";
    const grupoRegistroEntradasServicios = "Solpes-Registro-Entradas-Servicios";

    let existeGrupoEdicionContratos = this.grupos.find(x => x.title == grupoEdicionContratos);
    if (existeGrupoEdicionContratos != null) {
      this.PermisosEdicionContratos = true;
    }

    let existeGrupoRegistroEntradasBienes = this.grupos.find(x => x.title == grupoRegistroEntradasBienes);
    if (existeGrupoRegistroEntradasBienes != null) {
      this.PermisosRegistroEntradasBienes = true;
    }

    let existeGrupoRegistroEntradasServicios = this.grupos.find(x => x.title == grupoRegistroEntradasServicios);
    if (existeGrupoRegistroEntradasServicios != null) {
      this.PermisosRegistroEntradasServicios = true;
    }
  }

  public ngOnInit() {
    this.abrirCerrarMenu();
    this.ObtenerUsuarioActual();
  }
}
