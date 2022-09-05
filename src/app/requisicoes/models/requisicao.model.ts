import { Departamento } from "src/app/departamentos/models/departamento.model";
import { Equipamento } from "src/app/equipamentos/models/equipamento.model";

export class Requisicao{
  id: string;
  descricao: string;
  data: Date;
  departamentoId: string;
  departamento?: Departamento;
  equipamentoId: string;
  equipamento?: Equipamento;
  
}