var app = new Vue({
  el: '#container',
  data: {
    current: {},
    displayHeader: '',
    loading: true,
    definitionShow: false,
    noDefinition: false,
    showList: false,
    definitionDisplay: [],
    generalText: '',
    currentWord: '',
    starterWords: ["affect", "set", "go", "take", "stand", "get", "turn", "put", "fall", "strike"],
    currentThes: {},
    currentSynonyms: [],
    synonymToLookUp: [],
    previousWords: [],
  },
  created: function() {
    this.getSeedWord();
    this.getWord();
    this.getThesWord();
  },
  methods: {
    getWords: function() {
      axios.get("http://localhost:3000/api/words").then(response => {
  for (var i = 0; i < response.data.length; i++){
    if (i === response.data.length - 1) {
    this.previousWords.push(response.data[i].word);
  }
  }
	return true;
      }).catch(err => {
      });
    },
    addWords: function() {
      axios.post("http://localhost:3000/api/words", {
	word: this.currentWord,
	definition: this.definitionDisplay
      }).then(response => {
	//this.word = "";
	//this.definition = "";
	this.getWords();
	return true;
      }).catch(err => {
      });
    },
    deleteWords: function() {
      axios.get("http://localhost:3000/api/words").then(response => {
  for (var i = 0; i < response.data.length; i++){
      axios.delete("http://localhost:3000/api/words/" + response.data[i].id).then(response => {
  this.getWords();
  return true;
      }).catch(err => {
      });
    }
    this.previousWords = [];
    return true;
  }).catch(err => {
  });
      },
    getWord: function() {
      this.loading = true;
      var myurl= "https://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + this.currentWord + "?key=8c097ee5-8e3c-413e-b3c5-dc8501967414";
      fetch(myurl)
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          console.log(data);
          this.current = data;
          this.loading = false;
          this.parseDataDisplay();
          if (this.noDefinition === true) {
            this.getSeedWord();
            this.getWord();
            this.getThesWord();
            this.noDefinition = false;
          }
        })
        .catch(err => {
          console.log("error");
        });
      },
    parseDataDisplay: function () {
      var definitions = this.current.getElementsByTagName("dt");
      var toShow = "";
      var num = 1;
      this.definitionShow = false;
      for (var i = 0; i < definitions.length; i++){
        toShow += num + ". ";
        for (var j = 0; j < definitions.item(i).childNodes.length; j++){
            var dummy = definitions.item(i).childNodes[j].textContent;
            if (definitions.item(i).childNodes[j].nodeName === "#text" && dummy[0] === ':'){
              toShow += dummy.slice(1);
            }
            else {
              toShow += dummy;
            }
        }
        num++;
        this.definitionDisplay.push(toShow)
        toShow = "";
      }
    },
    getRandomInt: function(upperBound){
      return Math.floor(Math.random() * Math.floor(upperBound));
    },

    getSeedWord: function() {
      this.loading = true;
      var indexOfSeedWord = this.getRandomInt(this.starterWords.length)
      var value = this.starterWords[indexOfSeedWord]
      this.currentWord = value;
    },
    getThesWord: function() {
      var myurl= "https://www.dictionaryapi.com/api/v1/references/thesaurus/xml/" + this.currentWord + "?key=091b9d9b-b494-4da5-85cf-a68ddb3c590f"; ;
      fetch(myurl)
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          console.log(data);
          this.currentThes = data;
          var meanings = this.currentThes.getElementsByTagName("sens");
          for (var i = 0; i < meanings.length; i++){
            var synonyms = meanings[i].getElementsByTagName("syn");
            this.currentSynonyms.push(synonyms[0].textContent);
          }
        })
        .catch(err => {
          console.log("error");
        });
    },
    getRandomThesWord: function() {
      var lengthArray = this.currentSynonyms.length;
      var indexOfArray = this.getRandomInt(lengthArray - 1);
      // parse result
      console.log(indexOfArray);
      var word = "";
      for (var i = 0; i < this.currentSynonyms[indexOfArray].length; i++) {
        while(this.currentSynonyms[indexOfArray][i] !== ',' && this.currentSynonyms[indexOfArray][i] !== ' ' && this.currentSynonyms[indexOfArray][i] !== '('){
          if (i === this.currentSynonyms[indexOfArray].length){
            break;
          }
          word += this.currentSynonyms[indexOfArray][i];
          i++;
        }
        console.log(word);
        this.synonymToLookUp.push(word);
        word = "";
        if (this.currentSynonyms[indexOfArray][i] === ','){
          i++;
        }
        else if (this.currentSynonyms[indexOfArray][i] === '(') {
          while (this.currentSynonyms[indexOfArray][i] !== ')'){
            i++;
          }
        }
        else {}
      }
    var lengthWordsArray = this.synonymToLookUp.length;
    if (lengthWordsArray === 0) {
      this.getRandThesWord();
    }
    var indexWordsArray = this.getRandomInt(lengthWordsArray - 1);
    this.currentWord = this.synonymToLookUp[indexWordsArray];
    this.getAnotherWord();
  },
  showMeList: function() {
    this.showList = true;
  },
  addWordToList: function() {
    this.previousWords.push(this.currentWord);
  },
  getAnotherWord: function() {
    this.currentSynonyms = [];
    this.synonymToLookUp = [];
    this.definitionDisplay = [];
    this.loading = true;
    this.currentThes = {};
    this.getWord();
    this.getThesWord();
  },
  showMeDefinition: function() {
    this.definitionShow = true;
  }
    }
});
