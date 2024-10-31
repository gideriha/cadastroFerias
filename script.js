new Vue({
    el: '#app',
    data() {
        return {
            novoProfissional: {
                nome: '',
                squad: '',
                tipo: '',
                dataInicio: '',
                dataFim: ''
            },
            profissionais: [],
            exibirModalEdicao: false,
            profissionalEmEdicao: {},
            diasSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            semanas: [],
            cores: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8C33'], // Cores para profissionais
        };
    },
    mounted() {
        this.gerarCalendario();
    },
    methods: {
        cadastrarProfissional() {
            let profissional = { ...this.novoProfissional, cor: this.cores[this.profissionais.length % this.cores.length] };
            this.profissionais.push(profissional);
            this.gerarCalendario();
            this.novoProfissional = { nome: '', squad: '', tipo: '', dataInicio: '', dataFim: '' };
        },
        excluirProfissional(index) {
            this.profissionais.splice(index, 1);
            this.gerarCalendario();
        },
        editarProfissional(index) {
            this.profissionalEmEdicao = { ...this.profissionais[index], index };
            this.exibirModalEdicao = true;
        },
        salvarEdicao() {
            Vue.set(this.profissionais, this.profissionalEmEdicao.index, this.profissionalEmEdicao);
            this.exibirModalEdicao = false;
            this.gerarCalendario();
        },
        fecharModal() {
            this.exibirModalEdicao = false;
        },
        gerarCalendario() {
            let dataAtual = new Date();
            dataAtual.setDate(1);
            let primeiroDiaSemana = dataAtual.getDay();
            let diasMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();
            let semanas = [];
            let semana = new Array(7).fill(null).map((_, i) => ({
                diaMes: i >= primeiroDiaSemana ? i - primeiroDiaSemana + 1 : '',
                profissionais: []
            }));

            for (let dia = 1; dia <= diasMes; dia++) {
                let data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
                let diaSemana = data.getDay();
                
                semana[diaSemana] = { diaMes: dia, data, profissionais: [] };
                
                this.profissionais.forEach(prof => {
                    let inicio = new Date(prof.dataInicio);
                    let fim = new Date(prof.dataFim);
                    
                    if (data >= inicio && data <= fim) {
                        semana[diaSemana].profissionais.push({ nome: prof.nome, cor: prof.cor });
                    }
                });

                if (diaSemana === 6 || dia === diasMes) {
                    semanas.push(semana);
                    semana = new Array(7).fill(null).map((_, i) => ({ diaMes: '', profissionais: [] }));
                }
            }
            this.semanas = semanas;
        }
    }
});
