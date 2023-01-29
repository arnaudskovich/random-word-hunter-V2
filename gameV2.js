const alphabet = "abcdefghijklmnopqrstuvwxyz";
const lPlaceholders = document.getElementsByClassName("letter");
const lForm = document.getElementById("bottom");
const lInput = document.getElementById("letter");
const badLetters = document.getElementById("bad_letters");
const lifeCount = document.getElementById("life_count");
const submit = document.getElementById("submitBtn");
const restart = document.getElementById("restartBtn");
const feedback = document.getElementById("feedback");
const foundLetters = document.getElementById("found_letters");
const sampleLetterDiv = `<div class="letter">?</div>`;
const blockingDiv = document.createElement("div");
blockingDiv.id = "hidder";

class Game {
	constructor() {
		this._lives = 0;
		this._validLetters = [];
		this._invalidLetters = [];
		this._word = "";
	}
	async generateWord() {
		const currentHidder = document.body.appendChild(blockingDiv);
		currentHidder.focus();
		const letters = (await (await fetch("https://random-word-api.herokuapp.com/word/")).json())[0];
		this._lives = letters.length + 2;
		this._word = letters;
		currentHidder.remove();
		console.log(letters);
		return letters;
	}
	hasLetterIn(letter) {
		const letterPos = this._word.indexOf(letter);
		if (letterPos !== -1) {
			const positions = [letterPos];
			this._validLetters[letterPos] = letter;
			for (let i = letterPos + 1; i < this._word.length; i++) {
				if (this._word[i] === letter) {
					positions.push(i);
					this._validLetters[i] = letter;
				} else continue;
			}
			return positions;
		}
		if (this._invalidLetters.indexOf(letter) === -1) {
			const nextLives = this._lives - 1;
			this._lives = nextLives >= 0 ? nextLives : 0;
			this._invalidLetters.push(letter);
		}
		return false;
	}
	hasWon() {
		return this._validLetters.join("") === this._word;
	}
	async reset() {
		this._invalidLetters = [];
		this._validLetters = [];
		this._word = await this.generateWord();
	}
}

function start(word, life_count) {
	const letterDivs = [];
	let i = 0;
	while (i < word.length) {
		letterDivs.push(sampleLetterDiv);
		i++;
	}
	foundLetters.innerHTML = letterDivs.join("");
	lifeCount.innerText = life_count;
}

(async () => {
	const game = new Game();
	await game.generateWord();
	start(game._word, game._lives);
	lForm.addEventListener("submit", (e) => {
		e.preventDefault();
		e.stopPropagation();
		const vl = lInput.value;
		lInput.disabled = true;
		submit.disabled = true;
		lInput.value = "";
		let letterState = game.hasLetterIn(vl);
		if (!letterState) {
			feedback.innerText = "Mauvaise lettre";
			feedback.style.backgroundColor = "rgba(207, 2, 2, 0.651)";

			lifeCount.innerText = game._lives;
			badLetters.innerText = game._invalidLetters.join("");
			if (game._lives <= 0) {
				lInput.disabled = true;
				submit.disabled = true;
				feedback.innerHTML = "Vous avez perdu ! <br/> Le mot était: " + game._word;
				feedback.style.backgroundColor = "rgba(207, 2, 2, 0.651)";
				return;
			} else {
				setTimeout(() => {
					feedback.style.backgroundColor = "rgb(238, 238, 238)";
					feedback.innerText = "Entrez une lettre";
				}, 500);
			}
			lInput.disabled = false;
			submit.disabled = false;
			lInput.focus();
			return;
		}
		feedback.innerText = "Bonne lettre";
		feedback.style.backgroundColor = "rgba(2, 207, 36, 0.651)";
		for (const pos in letterState) {
			lPlaceholders[letterState[pos]].innerText = vl;
		}
		if (game.hasWon()) {
			feedback.innerText = "Vous avez trouvé le mot";
			feedback.style.backgroundColor = "rgba(2, 207, 36, 0.651)";
			return;
		} else {
			setTimeout(() => {
				feedback.style.backgroundColor = "rgb(238, 238, 238)";
				feedback.innerText = "Entrez une lettre";
			}, 500);
		}

		lInput.disabled = false;
		submit.disabled = false;
		lInput.focus();
	});

	restart.onclick = async function () {
		await game.reset();
		start(game._word, game._lives);
		lInput.disabled = false;
		submit.disabled = false;
		for (const p in lPlaceholders) {
			lPlaceholders[p].innerText = "?";
		}
		feedback.style.backgroundColor = "rgb(238, 238, 238)";
		feedback.innerText = "Entrez une lettre";
		lifeCount.innerText = game._lives;
		badLetters.innerText = "";
	};
})();
