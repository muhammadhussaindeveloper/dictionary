const form = document.getElementById('search-form');
const input = document.getElementById('word-input');
const result = document.getElementById('result-content');
const resultsPanel = document.getElementById('results');

function setStatus(message, isError = false) {
  result.replaceChildren();
  const paragraph = document.createElement('p');
  paragraph.className = isError ? 'status error' : 'status';
  paragraph.textContent = message;
  result.append(paragraph);
}

async function lookup(word) {
  if (!word) return;
  resultsPanel.scrollTo({ top: 0 });
  resultsPanel.setAttribute('aria-busy', 'true');
  setStatus(`Looking up “${word}”…`);

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error(`No English definition found for “${word}”. Check the spelling and try again.`);
      throw new Error('The dictionary is temporarily unavailable. Please try again.');
    }

    const entries = await response.json();
    const entry = entries[0];
    result.replaceChildren();

    const wordRow = document.createElement('div');
    wordRow.className = 'word-row';
    const heading = document.createElement('h2');
    heading.textContent = entry.word || word;
    wordRow.append(heading);

    const phonetic = entry.phonetic || entry.phonetics?.find(item => item.text)?.text;
    if (phonetic) {
      const phoneticText = document.createElement('p');
      phoneticText.className = 'phonetic';
      phoneticText.textContent = phonetic;
      wordRow.append(phoneticText);
    }
    result.append(wordRow);

    let definitionCount = 0;
    for (const meaning of entry.meanings || []) {
      const definitions = (meaning.definitions || []).filter(item => item.definition);
      if (!definitions.length) continue;

      const part = document.createElement('h3');
      part.className = 'part-of-speech';
      part.textContent = meaning.partOfSpeech || 'Meaning';
      result.append(part);

      const list = document.createElement('ol');
      list.className = 'definitions';
      for (const item of definitions) {
        const listItem = document.createElement('li');
        listItem.textContent = item.definition;
        if (item.example) {
          const example = document.createElement('span');
          example.className = 'example';
          example.textContent = `“${item.example}”`;
          listItem.append(example);
        }
        list.append(listItem);
        definitionCount++;
      }
      result.append(list);
    }

    if (!definitionCount) {
      setStatus(`No English definition found for “${word}”. Check the spelling and try again.`, true);
      return;
    }

    const googleLink = document.createElement('a');
    googleLink.className = 'google-link';
    googleLink.href = `https://www.google.com/search?q=${encodeURIComponent(`${word} meaning`)}`;
    googleLink.target = '_blank';
    googleLink.rel = 'noopener noreferrer';
    googleLink.textContent = `Search “${word}” on Google`;
    result.append(googleLink);
  } catch (error) {
    setStatus(error.message || 'Something went wrong while looking up that word. Please try again.', true);
  } finally {
    resultsPanel.setAttribute('aria-busy', 'false');
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  lookup(input.value.trim());
});

lookup('Dictionary');
