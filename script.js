const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHtml = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const perguntarAI = async (apiKey, game, question) => {
    const model = 'gemini-2.5-flash'
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias build e dicas.

        ## Regras
        - Se você não souber a resposta, responda com "Não sei a resposta para essa pergunta." e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo: ${game}.".
        - Considere a data atual ${new Date().toLocaleDateString()} para responder perguntas sobre eventos ou atualizações do jogo.
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para fornecer informações precisas e coerentes.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual do jogo.

        ## Reposta
        - Economize na resposta, seja direto e responda com no máximo 500 caracteres. 
        - Responda em markdown e português.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda a pergunta do usuário.
 
        ## Exemplo de resposta
        - Pergunta: "Qual é a melhor build para o campeão rengar jungle no patch atual?"
        - Resposta: "A melhor build para o campeão rengar no patch atual é: \n\n **Itens:**\n\n exemplos de itens.\n\n\ **Runas**:\n\n exemplos de runas."

        ---
        ## Pergunta do usuário
        Essa é a pergunta do usuário: ${question}
    `

    const contents = [{
        role: 'user',
        parts: [{
            text: pergunta
         }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    console.log('Resposta da AI:', data)
    return data.candidates[0].content.parts[0].text
}

form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos.')
        aiResponse.classList.remove('hidden')
        aiResponse.querySelector('.response-content').innerHTML = 'Por favor, preencha todos os campos.'
        setTimeout(() => {
            aiResponse.classList.add('hidden')
        }, 3000)
        return
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarAI(apiKey, game, question)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHtml(text)
        aiResponse.classList.remove('hidden')
    } catch (e) {
        console.error('Erro ao enviar a pergunta:', e)
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
})
