import { GithubUser } from "./GithubUser.js"
// Classe que vai conter a lógica dos dados
// Como os dados serão estruturados 
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
   
  }

    load () {
      this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save () {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  // Função assíncrona = aguardando essa promessa ser finalizada
  async add(username) { 
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado.')
      }

      const user = await GithubUser.search(username)
      if(user.login === undefined){
        throw new Error('Usuário não encontrado!')
      }
      
      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    // Higher-order functions (map, filter, find, reduce)
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
   
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// Classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }
  }

  update() { // Função que será chamada várias vezes toda vez que algum dado for mudado/adicionado/removido
    this.removeAllTr()
    this.noneFavs()

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `image de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }
      

      this.tbody.append(row)
    })
    
   }

   createRow () { // Função que irá retornar o 'tr', essa estrutura será utilizada pra cada elemento que estiver nos dados
    const tr = document.createElement('tr')
    tr.innerHTML = `   
    <td class="user">
      <img src="" alt="">
      <a href="" target="_blank">
        <p></p>
        <span></span>
      </a>
    </td>
    <td class="repositories"></td>
    <td class="followers"></td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `
    return tr
   }

  removeAllTr() { // Função para remover todos os TR do TBODY
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove()
    })
  }

  noneFavs() {
    if (this.entries.length === 0) {
      this.root.querySelector('.no-favs').classList.remove('hide')
    } else {
      this.root.querySelector('.no-favs').classList.add('hide')
    }
  }

  

}