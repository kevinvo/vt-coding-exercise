  function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  String.prototype.lowercase = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
  }

  function makeAPICall(url, successCallBack, errorCallBack) {
    fetch(url)
      .then(res => res.json())
      .then((out) => {
        successCallBack(out);
      })
      .catch(err => { 
        errorCallBack(err);
      });
  }

  class MyStorage {
    constructor() {
      this.myStorage = sessionStorage
    }

    setItem(key, value){
      this.myStorage.setItem(key, value);
    }

    getItem(key) {
      return this.myStorage.getItem(key);
    }
  }

  myStorage = new MyStorage();

  var MyConstants = {
    breedNameKey : "breed_name",
    totalImagesViewedCountKey: "total_images_viewed_count",
    imageNamePrefixKey: "name_",
    breedNamesKey: "breed_names",
  };

  class MyHistory {
    storeImageAndCount(imageUrl) {
      let totalImagesCount = myStorage.getItem(MyConstants.totalImagesViewedCountKey)
      if (totalImagesCount) {
        totalImagesCount = parseInt(totalImagesCount)
      } else {
        totalImagesCount = 0;
      }
      myStorage.setItem(this._createImageNameKey(totalImagesCount), imageUrl);
      totalImagesCount += 1;
      myStorage.setItem(MyConstants.totalImagesViewedCountKey, totalImagesCount);
    }

    updateUI(imageUrl) {
      const elem = document.createElement("img");
      elem.setAttribute("src", imageUrl);
      document.getElementById("history").prepend(elem);
    }

    restoreCompleteHistoryUI() {
      let totalImagesCount = myStorage.getItem(MyConstants.totalImagesViewedCountKey);
      if (totalImagesCount) {
        for (let i = 0; i < parseInt(totalImagesCount); ++i) {
          const imageUrl = myStorage.getItem(this._createImageNameKey(i));
          this.updateUI(imageUrl)
        }
      }
    }

    _createImageNameKey(index) {
      return MyConstants.imageNamePrefixKey + "_" + index
    }
  }
  
  myHistory = new MyHistory()


  //TODO: If I had more time, I would refactor all methods rendering pictures/dogbreed into a class.
  function displayRandomDogByBreed(breed_name) {
    const url = `https://dog.ceo/api/breed/${breed_name}/images/random`;
    var mainImage = document.getElementById('main-image');
    mainImage.className = "loader"
    mainImage.src = ""

    function success(json) {
      const imageUrl = json["message"];
      mainImage.className = ""
      mainImage.src = imageUrl;
      myHistory.storeImageAndCount(imageUrl)
      myHistory.updateUI(imageUrl)
    }

    function error(error) {
      alert("Error. Not handling it at the moment");
    }
    makeAPICall(url, success, error);
  }

  function getBreedNames(json) {
    const breedsHash = json["message"];
    const breeds = [];;
    Object.keys(breedsHash).forEach(function (breedName) {
      var breedTypes = breedsHash[breedName];
      if (breedTypes.length > 0) {
        for (const breedType of breedTypes) {
          const name = `${breedName}/${breedType}`;
          breeds.push(name);
        }
      } else {
        breeds.push(breedName);
      }
    });
    return breeds;
  }

  function displayAllBreedsAndCacheToStorage() {
    const url = "https://dog.ceo/api/breeds/list/all";

    function success(json) {
      const dogBreedsList = document.getElementsByClassName("dog-breeds-list")[0];
      const aClassName = "new-dog-breed";

      const breeds = getBreedNames(json);
      breeds.forEach(function(breedName) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = aClassName;
        a.href = "#";
        a.textContent = breedName.capitalize()
        li.appendChild(a);
        dogBreedsList.appendChild(li);
      });

      myStorage.setItem(MyConstants.breedNamesKey, JSON.stringify(breeds))

      var els = document.getElementsByClassName(aClassName);
      for (let i = 0; i < els.length; i++) {
        els[i].addEventListener('click', function (event) {
          const breedName = event.target.innerHTML.lowercase();
          displayImageByBreed(breedName);
        })
      }
    }
    function error(error) {
      alert("Error. Not handling it at the moment");
    }
    makeAPICall(url, success, error);
  }

  function displayImageByBreed(breedName) {
    const breedNameCaps = breedName.capitalize();
    document.getElementsByClassName("breed-name-title")[0].textContent = breedNameCaps;
    document.getElementsByClassName("new-dog-button")[0].innerText = "New " + breedNameCaps;
    myStorage.setItem(MyConstants.breedNameKey, breedName);
    displayRandomDogByBreed(breedName);
  }

  function newRandomBreed() {
    const breeds = JSON.parse(myStorage.getItem(MyConstants.breedNamesKey))
    const index = Math.floor(Math.random() * breeds.length) + 1;
    const breedName = breeds[index];
    displayImageByBreed(breedName);
  }

  function newRandomImage() {
    const breedName = myStorage.getItem(MyConstants.breedNameKey);
    displayRandomDogByBreed(breedName);
  }

  docReady(function() {
    function getBreedName() {
      let breedName = myStorage.getItem(MyConstants.breedNameKey);
      if (!breedName) {
        breedName = "shiba";
      }
      return breedName
    }
    const breedName = getBreedName();
    displayImageByBreed(breedName);
    myHistory.restoreCompleteHistoryUI();
    displayAllBreedsAndCacheToStorage();
  });