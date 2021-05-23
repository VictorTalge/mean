import { Injectable } from '@angular/core';
import { Cliente } from './cliente.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { stringify } from '@angular/compiler/src/util';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private clientes: Cliente[] = [];
  private listaClientesAtualizada = new Subject<{
    clientes: Cliente[];
    maxClientes: number;
  }>();

  constructor(private httpClient: HttpClient, private router: Router) {}
  getCliente(idCliente: string) {
    //return {...this.clientes.find((cli) => cli.id === idCliente)};
    return this.httpClient.get<{
      _id: string;
      nome: string;
      fone: string;
      email: string;
      imagemURL: string;
      criador: string;
    }>(`http://localhost:3000/api/clientes/${idCliente}`);
  }

  getClientes(pagesize: number, page: number): void {
    const parametros = `?pagesize=${pagesize}&page=${page}`;
    this.httpClient
      .get<{ mensagem: string; clientes: any; maxClientes: number }>(
        'http://localhost:3000/api/clientes' + parametros
      )
      .pipe(
        map((dados) => {
          return {
            clientes: dados.clientes.map((cliente) => {
              return {
                id: cliente._id,
                nome: cliente.nome,
                fone: cliente.fone,
                email: cliente.email,
                imagemURL: cliente.imagemURL,
                criador: cliente.criador,
              };
            }),
            maxClientes: dados.maxClientes,
          };
        })
      )
      .subscribe((dados) => {
        console.log(dados.clientes);
        this.clientes = dados.clientes;
        this.listaClientesAtualizada.next({
          clientes: [...this.clientes],
          maxClientes: dados.maxClientes,
        });
      });
  }

  adicionarCliente(nome: string, fone: string, email: string, imagem: File) {
    const dadosCliente = new FormData();
    dadosCliente.append('nome', nome);

    dadosCliente.append('fone', fone);
    dadosCliente.append('email', email);
    dadosCliente.append('imagem', imagem);
    this.httpClient
      .post<{ mensagem: string; cliente: Cliente }>(
        'http://localhost:3000/api/clientes',
        dadosCliente
      )
      .subscribe((dados) => {
        this.router.navigate(['/']);
      });
  }

  removerCliente(id: string) {
    return this.httpClient.delete(`http://localhost:3000/api/clientes/${id}`);
  }

  getListaDeClientesAtualizadaObservable() {
    return this.listaClientesAtualizada.asObservable();
  }

  atualizarCliente(
    id: string,
    nome: string,
    fone: string,
    email: string,
    imagem: File | string
  ) {
    //const cliente: Cliente = { id, nome, fone, email, imagemURL: null};
    let clienteData: Cliente | FormData;
    if (typeof imagem === 'object') {
      // é um arquivo, montar um form data
      clienteData = new FormData();
      clienteData.append('id', id);
      clienteData.append('nome', nome);
      clienteData.append('fone', fone);
      clienteData.append('email', email);
      clienteData.append('imagem', imagem, nome); //chave, foto e nome para o arquivo
    } else {
      //enviar JSON comum
      clienteData = {
        id: id,
        nome: nome,
        fone: fone,
        email: email,
        imagemURL: imagem,
        criador: null,
      };
    }
    console.log(typeof clienteData);
    this.httpClient
      .put(`http://localhost:3000/api/clientes/${id}`, clienteData)
      .subscribe((res) => {
        this.router.navigate(['/']);
      });
  }
}
