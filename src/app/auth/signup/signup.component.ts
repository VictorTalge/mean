import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../usuario.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  estaCarregando: boolean = false;
  private authObserver: Subscription;
  constructor(private usuarioService: UsuarioService) {}
  onSignup(form: NgForm) {
    if (form.invalid) return;
    this.usuarioService.criarUsuario(form.value.email, form.value.password);
  }

  ngOnInit(): void {
    this.authObserver = this.usuarioService
      .getStatusSubject()
      .subscribe((authStatus) => (this.estaCarregando = false));
  }
  ngOnDestroy(): void {
    this.authObserver.unsubscribe();
  }
}
