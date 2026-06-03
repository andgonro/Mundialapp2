import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { ClasificacionComponent } from './pages/clasificacion/clasificacion.component';
import { EstadisticasComponent } from './pages/estadisticas/estadisticas.component';
import { PartidosComponent } from './pages/partidos/partidos.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ClasificacionComponent
  },
  {
    path: 'partidos',
    component: PartidosComponent
  },
  {
    path: 'estadisticas',
    component: EstadisticasComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
