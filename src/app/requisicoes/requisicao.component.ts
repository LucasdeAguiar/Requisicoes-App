import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, Subscription } from 'rxjs';
import { AuthenticationService } from '../auth/services/authentication.service';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/models/equipamento.model';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
import { FuncionarioService } from '../funcionarios/services/funcionario.service';
import { Requisicao } from './models/requisicao.model';
import { RequisicaoService } from './service/requisicao.service';

@Component({
  selector: 'app-requisicao',
  templateUrl: './requisicao.component.html'
})
export class RequisicaoComponent implements OnInit, OnDestroy {

  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  private processoAutenticado$: Subscription ;

  public funcionarioLogadoId: string;
  public form: FormGroup;
  


  
  constructor(
    private   router: Router,
    private authService: AuthenticationService,
    private requisicaoService: RequisicaoService,
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }



   //Getters

   get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null{
    return this.form.get('id');
  }

  get descricao(): AbstractControl | null{
    return this.form.get("descricao");
  }

  get data(): AbstractControl | null{
    return this.form.get("data");
  }

  get departamentoId(): AbstractControl | null{
    return this.form.get("departamentoId");
  }

  get equipamentoId(): AbstractControl | null{
    return this.form.get("equipamentoId");
  }

  get funcionarioId(): AbstractControl | null{
    return this.form.get("funcionarioId");
  }



  ngOnInit(): void {
    
    this.form = this.fb.group({
      
      id: new FormControl(""),
      descricao: new FormControl(""),
      data: new FormControl(""),

      funcionarioId: new FormControl(""),
      funcionario: new FormControl(""),

      departamentoId: new FormControl(""),
      departamento: new FormControl(""),

      equipamentoId: new FormControl(""),
      equipamento: new FormControl("")

   
    });
    

   
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();



    this.authService.usuarioLogado.subscribe(usuario => {
      const email = usuario?.email!;

      this.processoAutenticado$ = this.funcionarioService.selecionarFuncionarioLogado(email)
      .subscribe(funcionario => {
        this.funcionarioLogadoId = funcionario.id;
        this.requisicoes$ = this.requisicaoService.selecionarRequisicoesFuncionarioAtual(this.funcionarioLogadoId);
      });
    })

  }

  ngOnDestroy(): void {
   this.processoAutenticado$.unsubscribe();
  }


 

 

      public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao){
        this.form.reset();
        this.configurarValoresPadrao();
        

        if(requisicao){
          const departamento = requisicao.departamento ? requisicao.departamento : null;

          const funcionario = requisicao.funcionario ? requisicao.funcionario : null;

          const equipamento = requisicao.equipamento ? requisicao.equipamento : null;

          const requisicaoCompleta = {
            ...requisicao,
            departamento,
            funcionario,
            equipamento
          }

          this.form.setValue(requisicaoCompleta);
        }

        try{
        await this.modalService.open(modal).result;

        if(this.form.dirty && this.form.valid){
          if(!requisicao){
            await this.requisicaoService.inserir(this.form.value);
          }else{
          await this.requisicaoService.editar(this.form.value);
          }
          
          this.showToatrSucess();
        }else{
        
          this.toastrService.error('O formulário precisa ser preenchido', 'Opa..');
        }

        

        }catch(error){
          this.showToatrError();
          console.log(error);
          
        }
        
      }

      public async excluir(requisicao: Requisicao){
        try{
          await this.requisicaoService.excluir(requisicao);
          this.showToatrRemove();
        }catch(error){
          this.toastrService.error("Houve um erro ao excluir a requisição", "Cadastro De Requisições")
        }
      }

      public configurarValoresPadrao(): void{
        this.form.get("data")?.setValue(new Date());
        this.form.get("equipamentoId")?.setValue(null);
        this.form.get("funcionarioId")?.setValue(this.funcionarioLogadoId);
      }

      

      //Toastr

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
