import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private autenticado: boolean = false;
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private idUsuario: string;
  private authStatusSubject = new Subject<boolean>();
  public getToken(): string {
    return this.token;
  }
  public getStatusSubject() {
    return this.authStatusSubject.asObservable();
  }
  constructor(private httpClient: HttpClient, private router: Router) {}
  criarUsuario(email: string, senha: string) {
    const authData: AuthData = {
      email: email,
      password: senha,
    };
    this.httpClient
      .post('http://localhost:3000/api/usuario/signup', authData)
      .subscribe({
        //vamos para a página principal pois o usuário foi criado com sucesso
        next: () => this.router.navigate(['/']),
        //notificamos todos os componentes que não há usuário autenticado
        error: () => this.authStatusSubject.next(false),
      });
  }
  login(email: string, senha: string) {
    const authData: AuthData = {
      email: email,
      password: senha,
    };
    this.httpClient
      .post<{ token: string; expiresIn: number; idUsuario: string }>(
        'http://localhost:3000/api/usuario/login',
        authData
      )
      .subscribe((resposta) => {
        this.token = resposta.token;
        if (this.token) {
          const tempoValidadeToken = resposta.expiresIn;
          this.tokenTimer = setTimeout(() => {
            console.log('rodou logout');
            this.logout();
          }, tempoValidadeToken * 1000);
          this.autenticado = true;
          this.idUsuario = resposta.idUsuario;
          this.authStatusSubject.next(true);
          this.salvarDadosDeAutenticacao(
            this.token,
            new Date(new Date().getTime() + tempoValidadeToken * 1000),
            this.idUsuario
          );
          this.router.navigate(['/']);
        }
      });
  }
  logout() {
    this.token = null;
    this.authStatusSubject.next(false);
    clearTimeout(this.tokenTimer);
    this.idUsuario = null;
    this.removerDadosDeAutenticacao();
    this.router.navigate(['/']);
  }
  autenticarAutomaticamente() {
    const dadosAutenticacao = this.obterDadosDeAutenticacao();
    if (dadosAutenticacao) {
      //pegamos a data atual
      const agora = new Date();
      //verificamos a diferenca entre a validade e a data atual
      const diferenca = dadosAutenticacao.validade.getTime() - agora.getTime();
      //se a diferença for positiva, o token ainda vale
      console.log(diferenca);
      if (diferenca > 0) {
        this.token = dadosAutenticacao.token;
        console.log(dadosAutenticacao);
        this.autenticado = true;
        this.idUsuario = dadosAutenticacao.idUsuario;
        //diferença ja esta em milissegundos, não multiplique!
        this.tokenTimer = setTimeout(() => {
          this.logout();
        }, diferenca);
        this.authStatusSubject.next(true);
      }
    }
  }
  public getIdUsuario() {
    return this.idUsuario;
  }
  public isAutenticado(): boolean {
    return this.autenticado;
  }
  private obterDadosDeAutenticacao() {
    const token = localStorage.getItem('token');
    const validade = localStorage.getItem('validade');
    const idUsuario = localStorage.getItem('idUsuario');
    return token && validade
      ? { token: token, validade: new Date(validade), idUsuario: idUsuario }
      : null;
  }
  private salvarDadosDeAutenticacao(
    token: string,
    validade: Date,
    idUsuario: string
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('validade', validade.toISOString());
    localStorage.setItem('idUsuario', idUsuario);
  }
  private removerDadosDeAutenticacao() {
    localStorage.removeItem('token');
    localStorage.removeItem('validade');
    localStorage.removeItem('idUsuario');
  }
}
