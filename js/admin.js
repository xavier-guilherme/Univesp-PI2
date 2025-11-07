// js/admin.js
// Script executado quando paginas/admin.html é carregada

(async function() {
    try {
        // 1. PROTEGER A PÁGINA: Verifica se está logado
        protectPage();
        
        // 2. VERIFICAR SE É ADMIN
        if (!isAdmin()) {
            document.getElementById('accessDenied').style.display = 'block';
            return;
        }
        
        // 3. EXIBIR CONTEÚDO ADMIN
        document.getElementById('adminContent').style.display = 'block';
        
        // 4. CONFIGURAR FORMULÁRIO
        const form = document.getElementById('createStudentForm');
        const successDiv = document.getElementById('createStudentSuccess');
        const errorDiv = document.getElementById('createStudentError');
        
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Reset mensagens
            successDiv.style.display = 'none';
            errorDiv.style.display = 'none';
            
            // Obter dados do formulário
            const formData = new FormData(form);
            const studentData = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                senha: formData.get('senha')
            };
            
            try {
                // Enviar para API
                const result = await postJsonAuth('/api/user/create', studentData);
                
                // Sucesso
                successDiv.textContent = `Aluno "${result.user.nome}" cadastrado com sucesso!`;
                successDiv.style.display = 'block';
                
                // Limpar formulário
                form.reset();
                
            } catch (error) {
                // Erro
                errorDiv.textContent = error.message || 'Erro ao cadastrar aluno';
                errorDiv.style.display = 'block';
            }
        });
        
    } catch (error) {
        if (error.message.includes("autenticado")) {
            return; // Redirecionamento já aconteceu
        }
        console.error("Erro na página admin:", error);
    }
})();
