import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { Funcionario } from 'src/app/funcionarios/models/funcionario.model';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Movimentacao } from '../models/movimentacao.model';
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../service/requisicao.service';

@Component({
  selector: 'app-requisicoes-departamento',
  templateUrl: './requisicoes-departamento.component.html'
})
export class RequisicoesDepartamentoComponent implements OnInit {

  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  private processoAutenticado$: Subscription ;

  public funcionarioLogado: Funcionario;
  public requisicaoSelecionada: Requisicao;
  public listaStatus: string[] = ["Aberta", "Processando", "Não Autorizada", "Fechada"];
  public form: FormGroup;
  


  
  constructor(
    private router: Router,
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

  get id(): AbstractControl | null{
    return this.form.get('id');
  }

  get status(): AbstractControl | null{
    return this.form.get('status');
  }

  get data(): AbstractControl | null{
    return this.form.get("data");
  }

 

  get equipamentoId(): AbstractControl | null{
    return this.form.get("equipamentoId");
  }

  get funcionarioId(): AbstractControl | null{
    return this.form.get("funcionarioId");
  }



  ngOnInit(): void {
    
    this.form = this.fb.group({
       status: new FormControl("", [Validators.required]),  
       descricao: new FormControl("", [Validators.required, Validators.minLength(6)]), 
       funcionario: new FormControl(""), 
       data: new FormControl(""), 
    });
    

   
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.requisicoes$ = this.requisicaoService.selecionarTodos();


    this.authService.usuarioLogado.subscribe(usuario => {
      const email = usuario?.email!;

      this.processoAutenticado$ = this.funcionarioService.selecionarFuncionarioLogado(email)
      .subscribe(funcionario =>  this.funcionarioLogado = funcionario);
    })

  }

  ngOnDestroy(): void {
   this.processoAutenticado$.unsubscribe();
  }


 

 

      public async gravar(modal: TemplateRef<any>, requisicao: Requisicao){
        this.requisicaoSelecionada = requisicao;
        this.requisicaoSelecionada.movimentacoes = requisicao.movimentacoes ? requisicao.movimentacoes : [];
       
        this.form.reset();
       
        this.configurarValoresPadrao();
        

        try{
        await this.modalService.open(modal).result;

        if(this.form.dirty && this.form.valid){

          this.atualizarRequisicao(this.form.value);
         
          await this.requisicaoService.editar(this.requisicaoSelecionada);
          
          
          this.showToatrSucess();
        }else{
        
          this.toastrService.error('O formulário precisa ser preenchido', 'Opa..');
        }

        

        }catch(error){
          this.showToatrError();
          console.log(error);
          
        }
        
      }

      private atualizarRequisicao(movimentacao: Movimentacao){
        this.requisicaoSelecionada.movimentacoes.push(movimentacao);
        this.requisicaoSelecionada.status = this.status?.value;
        this.requisicaoSelecionada.ultimaAtualizacao = new Date();
      }
   

      public configurarValoresPadrao(): void{
       this.form.patchValue({
          funcionario: this.funcionarioLogado,
          status: this.requisicaoSelecionada?.status,
          data: new Date()
       });
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
