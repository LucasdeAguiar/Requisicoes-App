import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/models/equipamento.model';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
import { Requisicao } from './models/requisicao.model';
import { RequisicaoService } from './service/requisicao.service';

@Component({
  selector: 'app-requisicao',
  templateUrl: './requisicao.component.html'
})
export class RequisicaoComponent implements OnInit {

  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;


  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private requisicaoService: RequisicaoService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      requisicao: new FormGroup({
      id: new FormControl(""),
      descricao: new FormControl("", [Validators.required , Validators.minLength(3)]),
      data: new FormControl("", [Validators.required]),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),
      equipamentoId: new FormControl("", [Validators.required]),
      equipamento: new FormControl("")
      }),
      senha: new FormControl("")
    });
    

    this.requisicoes$ = this.requisicaoService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
  }


  //Getters

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null{
    return this.form.get("requisicao.id");
  }

  get descricao(): AbstractControl | null{
    return this.form.get("requisicao.nome");
  }

  get data(){
    return this.form.get("requisicao.data");
  }

  get departamentoId(): AbstractControl | null{
    return this.form.get("requisicao.departamentoId");
  }

  get equipamentoId(): AbstractControl | null{
    return this.form.get("requisicao.equipamentoId");
  }


  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao){
    this.form.reset();
     
    if(requisicao){
      const departamento = requisicao.departamento ? requisicao.departamento : null;

      const equipamento = requisicao.equipamento ? requisicao.equipamento : null;

      const requisicaoCompleta = {
        ...requisicao,
        departamento,
        equipamento
      }

      this.form.get("requisicao")?.setValue(requisicaoCompleta);
    }

    try{
     await this.modalService.open(modal).result;

    if(this.form.dirty && this.form.valid){
      if(!requisicao){

      //  await this.authService.cadastrar(this.email?.value, this.senha?.value); // talvez não precise dessa linha
         
        await this.requisicaoService.inserir(this.form.get("requisicao")?.value);

        await this.authService.logout();

        await this.router.navigate(["/login"]);
      }
      
     else
      await this.requisicaoService.editar(this.form.get("requisicao")?.value);
 
      this.showToatrSucess();
    }else{
      this.toastrService.error('O formulário precisa ser preenchido', 'Opa..');
    }

    

    }catch(error){
      this.showToatrError();
      console.log(error);
      
    }
    
  }

      public excluir(requisicao: Requisicao){
        this.requisicaoService.excluir(requisicao);
        this.showToatrRemove();
      }

      public showToatrSucess(){
      this.toastrService.success('Cadastro efetuado', 'Sucesso!');
      }

      public showToatrError(){
      this.toastrService.error('Cadastro não efetuado', 'Opa..');
      }

      public showToatrRemove(){
      this.toastrService.info('Cadastro removido', 'Remoção..');
      }
}
