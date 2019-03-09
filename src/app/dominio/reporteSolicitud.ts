export class ReporteSolicitud {
    constructor(public estado: string,
        public consecutivo: string,
        public numeroSolpSap: string,
        public cm: string,
        public ordenadorGastos: any,
        public comprador: any,
        public categoria: string,
        public subcategoria: string,
        public pais: any,
        public alcance: string,
        public fueSondeo: boolean,
        public fechaSolicitud: Date,
        public fechaSondeo: Date,
        public fechaRevisarSodeo: Date,
        public fechaVerificarMaterial: Date,
        public fechaRegistrarActivo: Date,
        public fechaRegistrarSolpSap: Date,
        public fechaRegistrarContrato: Date,
        public fechaEnvioProveedor: Date) {}

        
        public static fromJson(element: any) {
            return new ReporteSolicitud(element.Estado,
                element.Consecutivo,
                element.NumSolSAP,
                element.CM,
                element.OrdenadorGastos,
                element.Comprador,
                element.Categoria,
                element.Subcategoria,
                element.Pais,
                element.Alcance,
                element.FueSondeo,
                element.FechaDeCreacion,
                element.FechaSondeo,
                element.FechaRevisarSondeo,
                element.FechaVerificarMaterial,
                element.FechaRegistrarActivo,
                element.FechaRegistrarSolpsap,
                element.FechaRegistrarContrato,
                element.FechaEnvioProveedor)
        }

        public static fromJsonList(elements: any) {
            var list = [];
            for (var i = 0; i < elements.length; i++) {
                list.push(this.fromJson(elements[i]));
            }
            return list;
        }
}