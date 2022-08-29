import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DepartamentoComponent } from './departamentos/departamento.component';
import { EquipamentoComponent } from './equipamentos/equipamento.component';
import { PainelComponent } from './painel/painel.component';

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full"},
  { path: "login", component: LoginComponent },
  {path: "painel", component: PainelComponent},
  {path: "departamentos", component: DepartamentoComponent},
  {path: "equipamentos", component: EquipamentoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
