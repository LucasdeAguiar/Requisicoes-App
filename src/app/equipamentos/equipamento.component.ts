import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder,FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Equipamento } from './models/equipamento.model';
import { EquipamentoService } from './services/equipamento.service';

@Component({
  selector: 'app-equipamento',
  templateUrl: './equipamento.component.html'
})
export class EquipamentoComponent implements OnInit {
  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;
  
  constructor(
    private equipamentoService: EquipamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr  : ToastrService
  ) {};

  
  ngOnInit(): void {
    this.equipamentos$ = this.equipamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl(""),
      preco: new FormControl(""),
      data: new FormControl("")
    });
  }

//Getters 

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(){
    return this.form.get("id");
  }

  get nome(){
    return this.form.get("nome");
  }

  get telefone(){
    return this.form.get("preco");
  }

  get data(){
    return this.form.get("data");
  }

  public async gravar(modal: TemplateRef<any>, equipamento?: Equipamento){
    this.form.reset();
     
    if(equipamento)
      this.form.setValue(equipamento);


    try{
     await this.modalService.open(modal).result;

    if(!equipamento)
     await this.equipamentoService.inserir(this.form.value);
    else
     await this.equipamentoService.editar(this.form.value);

     this.showToatrSucess();

    }catch(error){
      this.showToatrError();
      console.log(error);
      
    }
    
  }

  public excluir(equipamento: Equipamento){
     this.equipamentoService.excluir(equipamento);
     this.showToatrRemove();
  }

  public showToatrSucess(){
    this.toastr.success('Cadastro efetuado', 'Sucesso!');
  }

  public showToatrError(){
    this.toastr.error('Cadastro não efetuado', 'Opa..');
  }

  public showToatrRemove(){
    this.toastr.info('Cadastro removido', '...');
  }

}
