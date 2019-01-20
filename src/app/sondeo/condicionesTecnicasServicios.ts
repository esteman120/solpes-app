export class CondicionTecnicaServicios{
  IdServicios: any;
 
    constructor(
        public indice: number,
        public titulo: string,
        public idSolicitud: any,
        public codigo: string,
        public descripcion: string,
        public cantidad: number,
        public valorEstimado: number,
        public comentarios: string,
        public adjunto?: any,
        public tipoMoneda?: string,
        public PrecioSondeo?: number,
        public archivoAdjunto?: File,
        public Estado?: string,
        public id?: number) { }

    public static fromJson(element: any) {
        return new CondicionTecnicaServicios(element.Title,
            element.Solicitud,
            element.Codigo,
            element.Descripcion,
            element.Cantidad,
            element.ValorEstimado,
            element.Comentario,
            element.TipoMoneda,
            element.ID);
    }

    public static fromJsonList(elements: any) {
        var list = [];
        for (var i = 0; i < elements.length; i++) {
            list.push(this.fromJson(elements[i]));
        }
        return list;
    }
}