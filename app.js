let vocabulary = []
let filteredWords = []
let currentIndex = 0

const startBtn = document.getElementById('startBtn')
const checkBtn = document.getElementById('checkBtn')
const answerInput = document.getElementById('answerInput')
const resultBox = document.getElementById('resultBox')
const practiceSection = document.getElementById('practiceSection')
const progress = document.getElementById('progress')

startBtn.addEventListener('click', startPractice)
checkBtn.addEventListener('click', checkAnswer)

async function startPractice() {

  const topic = document.getElementById('topicSelect').value

  const start = Number(
    document.getElementById('startRange').value
  )

  const end = Number(
    document.getElementById('endRange').value
  )

  const url = SHEETS[topic]

  const response = await fetch(url)

  const csv = await response.text()

  vocabulary = parseCSV(csv)

  filteredWords = vocabulary.filter(item => {
    return item.id >= start && item.id <= end
  })

  currentIndex = 0

  practiceSection.classList.remove('hidden')

  loadWord()
}

function parseCSV(csv) {

  const lines = csv.split('\n')

  return lines.slice(1).map(line => {

    const cols = line.split(',')

    return {
      id: Number(cols[0]),
      word: cols[1],
      ipa: cols[2],
      meaning: cols[3],
      example: cols[4]
    }
  })
}

function loadWord() {

  if(currentIndex >= filteredWords.length) {

    alert('Finished!')

    return
  }

  answerInput.value = ''

  resultBox.innerHTML = ''

  const current = filteredWords[currentIndex]

  progress.innerText =
    (currentIndex + 1) + ' / ' + filteredWords.length

  speakWord(current.word)
}

function speakWord(word) {

  const speech =
    new SpeechSynthesisUtterance(word)

  speech.lang = 'en-US'

  speech.rate = 0.8

  window.speechSynthesis.speak(speech)
}

function checkAnswer() {

  const current = filteredWords[currentIndex]

  const userAnswer =
    answerInput.value.trim().toLowerCase()

  if(userAnswer === current.word.toLowerCase()) {

    resultBox.innerHTML = `
      <h2 class="correct">✅ Correct</h2>

      <p><b>Word:</b> ${current.word}</p>

      <p><b>IPA:</b> ${current.ipa}</p>

      <p><b>Meaning:</b> ${current.meaning}</p>

      <p><b>Example:</b> ${current.example}</p>
    `

    currentIndex++

    setTimeout(() => {
      loadWord()
    }, 2500)

  } else {

    resultBox.innerHTML =
      '<h2 class="wrong">❌ Incorrect</h2>'
  }
}

function showAnswer() {

  const current = filteredWords[currentIndex]

  resultBox.innerHTML = `
    <h2>👀 Answer</h2>

    <p><b>Word:</b> ${current.word}</p>

    <p><b>IPA:</b> ${current.ipa}</p>

    <p><b>Meaning:</b> ${current.meaning}</p>

    <p><b>Example:</b> ${current.example}</p>
  `
}

document.addEventListener('keydown', (event) => {

  const current = filteredWords[currentIndex]

  if(!current) return

  // Shift = Replay
  if(event.key === 'Shift') {
    speakWord(current.word)
  }

  // Ctrl = Show Answer
  if(event.ctrlKey) {
    showAnswer()
  }

  // Enter = Check
  if(event.key === 'Enter') {
    checkAnswer()
  }
})