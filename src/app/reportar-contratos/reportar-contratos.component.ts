import { Component, OnInit } from '@angular/core';
import { ExcelService } from '../servicios/excel.service';

@Component({
  selector: 'app-reportar-contratos',
  templateUrl: './reportar-contratos.component.html',
  styleUrls: ['./reportar-contratos.component.css']
})
export class ReportarContratosComponent implements OnInit {
  bsValue = new Date();
  minDate: Date;
  maxDate: Date;
  rangoFecha: Date[];

  constructor(private servicioExcel: ExcelService) { 
    this.minDate = new Date("01/01/2019");
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
    this.maxDate.setDate(this.maxDate.getDate());
    this.rangoFecha = [this.bsValue, this.maxDate];
  }

 

  ngOnInit() {
  }

  generarReporte(){
    console.log(this.rangoFecha);
  }

}