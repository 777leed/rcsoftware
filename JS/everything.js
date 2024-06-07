import { Space } from '../models/Space.js';
import { Thought } from '../models/ThoughtModel.js';
import { geminiReplies, performSearchAndReturnLinks, capitalizeFirstLetter, jsonExporter } from './vanillaFunctions.js';
import { extractYouTubeId, getVideoInfo } from "./youtubeHelper.js";
import { scrollCounter, fadeIn } from './animation.js'
import { initializeIndexedDB } from "./databaseHelper.js";
import { saveJSONFile } from './fileSaver.js';

const { v4: uuid } = require('uuid');
const DB_NAME = 'spaces_database';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'spaces';
var open = false;
var space;
var myInput;
var thoughtContainer;
var spacenamee;
let selectedElements = [];
let selectedPressed = false; // Flag to track if Ctrl key is pressed
const selectionButton = document.getElementById('select-btn');
const conceptButton = document.getElementById('concept-btn')
const sumButton = document.getElementById('sum-btn');
const typebar = document.getElementById('typebar');
const floatingButtons = [selectionButton,conceptButton,sumButton];
var indexWrapper;

initializeIndexedDB(DB_NAME, DB_VERSION, OBJECT_STORE_NAME, init);
fetchingDomElements();
vanillaTime();


// menu opening handler
spacenamee.addEventListener('click', (event) => {
  event.stopPropagation();
  document.getElementById('space-menu').style.display = 'flex';
  open = true;
  document.getElementById('changeBackgroundButton').addEventListener('click', function() {
    triggerfileExplorer(); 
    document.getElementById('changeBackgroundOption').click()
});

document.getElementById('changeBackgroundButton').addEventListener('contextmenu', function() {
            // Set the background image using the data URL
            space.background = `
            radial-gradient(circle at 1px 1px, rgba(168, 166, 166, 0.459) 1px, transparent 0)
          `;    

          space.save()
          updateReceiver();
});

  
})

function triggerfileExplorer() {
  document.getElementById('changeBackgroundOption').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Create a new FileReader
        const reader = new FileReader();

        // When the file is loaded
        reader.onload = function(event) {
            // Get the data URL of the loaded file
            const imageDataUrl = event.target.result;
            
         
            // Set the background image using the data URL
            space.background = `
            linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)),
            url('${imageDataUrl}') center/cover no-repeat
          `;    

          space.save()
          updateReceiver();


   
        };

        // Read the file as a data URL
        reader.readAsDataURL(file);
    }
});
}

function setbackground(wrapper,backgroundImage) {
  wrapper.style.background = backgroundImage;
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0';
  wrapper.style.right = '0';
  wrapper.style.zIndex = '1';
  wrapper.style.display = 'block';
  wrapper.style.width = '100%';
  wrapper.style.height = '100%';
  wrapper.style.filter = 'blur(5px)';
}

// menu disposal handler
document.addEventListener('click', (event) => {
  if (open && !document.getElementsByClassName('space-title-container')[0].contains(event.target)) {
      var popup = document.getElementById('space-menu');
      popup.style.display = 'none'
      open = false;
  }
});

// Event listener for keydown event on myInput
myInput.addEventListener('keydown', handleKeyDown);

// input box focuses on typing
document.addEventListener('keyup', function(event) {
  // var isLetter = event.keyCode >= 65 && event.keyCode <= 90;
  // var nothingIsFocused = document.activeElement === document.body;
  if (event.keyCode !== 13) {
    myInput.focus();
    typebar.style.display = 'flex';

  }
  else {
    myInput.value = '';
    typebar.style.display = 'none';

  }


});



// preventing defaults
document.addEventListener('dragstart', function (e) {
  e.preventDefault();
});

// button functions
conceptButton.addEventListener('click', async () => {
  sidePanelHandler(1)
});

sumButton.addEventListener('click', async () => {
sidePanelHandler(2)
});

selectionButton.addEventListener('click', async () => {
  selectedPressed = !selectedPressed;
  // Remove existing event listeners from all elements with class 'thought'
if (selectedPressed) {
  selectionButton.style.opacity = "0.5"
  Array.from(document.getElementsByClassName('thought')).forEach(element => {
    const clonedElement = element.cloneNode(true); // Clone the element
    element.parentNode.replaceChild(clonedElement, element); // Replace the original element with the cloned one to remove event listeners
    clonedElement.addEventListener('click', ()=> {
      toggleSelection(clonedElement);
      if (clonedElement.classList.contains('selected')) {
        multipleDragListener(clonedElement, clonedElement.id);
      }
    });
  });
} else {
  selectionButton.style.opacity = "1"
  Array.from(document.getElementsByClassName('thought')).forEach(element => {
      const clonedElement = element.cloneNode(true); // Clone the element
      element.parentNode.replaceChild(clonedElement, element); // Replace the original element with the cloned one to remove event listeners
      dragListener(clonedElement, clonedElement.id)
      attachDeleteListener(clonedElement, clonedElement.id)
      clonedElement.style.color = "#3f3f3f"
    });
    selectedElements = [];

  
}
});


// Function to initialize a space or make a new one
async function initSpace(db) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const isThisNew = urlParams.get('isThisNew');

  if (isThisNew === 'true') {

    const spacename = urlParams.get('spacename');
    const spaceId = uuid();
    const spaceDate = new Date().toLocaleDateString();
    const spaceName = spacename;
    const spaceThoughtList = [];
    
    space = new Space(spaceId, spaceDate, spaceName, spaceThoughtList, db);
    space.save(); // Save space details to IndexedDB
    spacenamee.innerHTML = capitalizeFirstLetter(space.name);
    
  } else {
    const spaceidd = urlParams.get('spaceid');
    space = new Space(spaceidd, null, null, null, db);
    await space.load();
    spacenamee.innerHTML = capitalizeFirstLetter(space.name);
    
  }

}
// Function to handle key down event
async function handleKeyDown(event) {
  if (event.keyCode === 13) {
    const inputText = myInput.value.trim();
    if (inputText === '/delete everything') {
      space.clearThoughts();
      space.save();
    } 
    else if (inputText === '/concepts') {
      myInput.value = '';
      sidePanelHandler(1)
  
    }
    else if (inputText === '/keynotes') {
      myInput.value = '';
      sidePanelHandler(2)
  
    }
    else if (inputText === '/export') {
      myInput.value = '';
      saveJSONFile(jsonExporter(space),space.name);

  
    }
    else if (inputText.startsWith('/youtube')) {
      const vidUrl = inputText.slice('/youtube'.length).trim();
      if (vidUrl !== '') {
        
        const vidInfoList = await getVideoInfo(extractYouTubeId(vidUrl));
        const transcSummary = await geminiReplies(3,space,vidInfoList[3],'')
        vidInfoList[3] = transcSummary;
        const newthought = new Thought(uuid(),new Date().toLocaleDateString(),vidInfoList,getRandomPosition(),true,inputText.length > 50,false,true);
        space.addThought(newthought);
        updateReceiver();

        myInput.value = '';
        typebar.style.display = 'none';
    
      } else {
          // Handle the case where "/play" is followed by nothing
          console.log('Please provide a URL or a search term after "/youtube".');
      }

  
    }
    else if (inputText.startsWith('/image')) {
      imageSearchHandler(inputText,false);
  }
    else if (inputText.startsWith('/gif')) {
      imageSearchHandler(inputText,true);
  }
    else if (inputText.startsWith('/prompt')) {
      const customPrompt = inputText.slice('/prompt'.length).trim();
      const awaitedJsonString = await geminiReplies(5,space,'',customPrompt);
      console.log(awaitedJsonString);
    }
    else if (inputText.startsWith('/dark') || inputText.startsWith('/night vision')) {
      initiateDarkMode();
      myInput.value = '';

    }  
    else if (inputText !== '') {
      const newthought = new Thought(uuid(),new Date().toLocaleDateString(),inputText,getRandomPosition(),true,inputText.length > 50,false,false);
      space.addThought(newthought);
      updateReceiver();

    }
  }
}
function updateReceiver() {
  thoughtContainer.innerHTML = ''
  renderThoughts();
  myInput.value = '';
}
// Function to render thoughts on the UI
function renderThoughts() {
  const everything = document.getElementById('everything');
  setbackground(everything,space.background);
  
          // Set the z-index for indexWrapper
          
          indexWrapper.style.zIndex = '1000';

  if (space.thoughtList && space.thoughtList.length > 0) {
    space.thoughtList.forEach(thought => {
    const thoughtElement = document.createElement('div');
    if (thought.isImg) {
      thoughtElement.classList.add('image-elm');
      const img = document.createElement('img');
      img.width = 100
      img.src = thought.text;
      img.alt = 'image element';
      thoughtElement.appendChild(img);      
    }
    else if(thought.isYoutubeVid) {
      const youtube_container = document.createElement('div');
      youtube_container.className = 'youtube-container'
      youtube_container.classList.add('glassify')


      const thumbnailImage = document.createElement('div');
      thumbnailImage.className = 'thumbnail';
      const thumbnailimg = document.createElement('img');
      thumbnailimg.src = thought.text[2];
      thumbnailImage.appendChild(thumbnailimg)


      const video_title = document.createElement('div');
      const video_title_span = document.createElement('span');
      video_title_span.classList.add('video-title', 'line-clamp')
      video_title_span.innerHTML = thought.text[0] + ' - ' + thought.text[1]
      video_title.appendChild(video_title_span);


      const transc = document.createElement('div');
      // ⚠️ the list has no styling yet
      const transcList = document.createElement('ul');
      transc.classList.add('transc-container', 'scroll_enabled');
      // ⚠️ you need to make escape characters are not going to cause a problem when converting from json to an array
      console.log(thought.text[3]);
      // const arrayTr = JSON.parse(thought.text[3].replace(/'/g, '"'));

      // Use regular expression to match the strings within single quotes
      const regex = /"(.*?)"/g;

      // Array to store the matched strings
      const arrayTr = [];
      let match;

      // Iterate over each match and extract the string
      while ((match = regex.exec(thought.text[3])) !== null) {
        arrayTr .push(match[1]);
      }
      
      arrayTr.forEach((element)=>{
        const transcListElement = document.createElement('li');
        transcListElement.innerHTML = element.toString();
        transcList.appendChild(transcListElement);
      })
      youtube_container.appendChild(video_title);
      youtube_container.appendChild(thumbnailImage);
      transc.appendChild(transcList);
      youtube_container.appendChild(transc);
      thoughtElement.appendChild(youtube_container);

    }
    else {
      thoughtElement.innerText = thought.text;

    }
      thoughtElement.classList.add('thought');
      thoughtElement.style.left = thought.position.x + 'px';
      thoughtElement.style.top = thought.position.y + 'px';
      thoughtElement.id = thought.id;
         // FOR DRAGGING AND DROPPING
      dragListener(thoughtElement,thought.id);
      doubleClickListener(thoughtElement,thought.text)
      attachDeleteListener(thoughtElement, thought.id);
      thoughtContainer.appendChild(thoughtElement);
      if(thought.isNew == true){
        fadeIn(thoughtElement);
        thoughtElement.classList.add('super-thought')
        thought.isNew = false;
        space.save();
        setTimeout(() => {
          thoughtElement.classList.remove('super-thought');
        }, 2000);
      }
      
    });
  }
  scrollCounter(space.thoughtList.length);

}
function getRandomPosition() {
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 100;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  
  return { x, y };
}
// Function to initialize space and load thoughts on launch
async function init(db) {
  await initSpace(db);
  updateReceiver();
  console.log('initializing');
}
async function updateThoughtPosition(thoughtId, newPosition) {
  const index = space.thoughtList.findIndex(thought => thought.id === thoughtId);
  if (index !== -1) {
    space.thoughtList[index].position = newPosition;
    await space.save();

  }

}
function attachDeleteListener(thoughtElement, thoughtId) {
  thoughtElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    space.removeThought(thoughtId);
    updateReceiver();    

  });
}
function doubleClickListener(thoughtElement, thoughtText) {
  thoughtElement.addEventListener('dblclick', (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(thoughtText)
    .then(() => {
      console.log('Text copied to clipboard successfully');
    })
    .catch(err => {
      console.error('Unable to copy text to clipboard:', err);
    });

  });
}
function dragListener(element,thoughtId) {
  element.draggable = true;
  element.addEventListener('mousedown', (event) => {
    element.classList.add('dragging');
    element.classList.add('thought');
    let offsetX = event.clientX - element.getBoundingClientRect().left;
    let offsetY = event.clientY - element.getBoundingClientRect().top;

    function onMouseMove(moveEvent) {
      element.style.left = moveEvent.clientX - offsetX + 'px';
      element.style.top = moveEvent.clientY - offsetY + 'px';
    }

    function onMouseUp() {
      element.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const newPosition = {
        x: parseFloat(element.style.left),
        y: parseFloat(element.style.top),
      };
      updateThoughtPosition(thoughtId, newPosition);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}
async function sidePanelHandler(index) {
  const awaitedJsonString = await geminiReplies(index,space,'','');
  const jsonString = awaitedJsonString;
  console.log(jsonString);
  const resultArray = JSON.parse(jsonString);
  index === 1 ? fillConcepts(resultArray):fillKeynotes(resultArray);
  openSidePanel(index);

}
function imageSearchMaker(imageContainer,link, inputText) {
  const imageElement = document.createElement('div');
  imageElement.className = 'image-elm';
  const img = document.createElement('img');
  img.src = link;
  img.alt = 'image element';
  
  // Listen for the load event on the image
  img.addEventListener('load', checkAllImagesLoaded);
  
  imageElement.appendChild(img);
  imageContainer.appendChild(imageElement);
  imageElement.addEventListener('click',(event) => {
  imageContainer.innerHTML = '';
  imageContainer.style.display = 'none';
  const newthought = new Thought(uuid(),new Date().toLocaleDateString(),link,getRandomPosition(),true,inputText.length > 50,true,false);
  space.addThought(newthought);
  updateReceiver();
  
  });
}
function checkAllImagesLoaded(links,loadedCount, imageContainer) {
  loadedCount++;
  if (loadedCount === links.length) {
      // Show the image container after all images are loaded
      imageContainer.style.display = 'block';
  }
}
function imageSearchHandler(inputText,gif) {
  const searchTerm = inputText.slice('/image'.length).trim();
  if (searchTerm !== '') {
    const gifprompt = gif ? ' gif' : '';
      performSearchAndReturnLinks(searchTerm + gifprompt )
          .then(function(links) {
              if (links.length > 0) {
                  const imageContainer = document.getElementById('image-container');
                  imageContainer.innerHTML = '';
                  // Counter to track the number of loaded images
                  let loadedCount = 0;
                  checkAllImagesLoaded(links, loadedCount, imageContainer)
                  links.slice(0, 7).forEach(link => {
                    imageSearchMaker(imageContainer,link,inputText)
                  });
                  imageContainer.style.display = 'flex'

              } else {
                  console.log('No images found');
              }
          });

  } else {
      // Handle the case where "/play" is followed by nothing
      console.log('Please provide a search term after "/image".');
  }
}
function fetchingDomElements() {
  indexWrapper = document.getElementById('indexWrapper')
  myInput = document.getElementById('my-input');
  thoughtContainer = document.getElementById('thoughtContainer');
  spacenamee =  document.getElementById('spacenamee');
  }

  function vanillaTime() {
    const timeRef = document.getElementById('timeRef');
    
    function updateTime() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes.toString().length == 2 ? minutes.toString() : '0' + minutes.toString();
      timeRef.innerText = `${hours}:${formattedMinutes}`;
    }
    
    // Call updateTime initially to set the time immediately
    updateTime();
    
    // Call updateTime every second to update the time
    setInterval(updateTime, 1000);
  }
  

   
function openSidePanel(side) {
    if (side === 1) {
      document.getElementById('sidec').style.left = 0;
      document.getElementById('close-sd').addEventListener('click', () => {
        document.getElementById('sidec').style.left = "-36em";
      });
    }
    else {
      document.getElementById('sidek').style.right = 0;
      document.getElementById('close-sdk').addEventListener('click', () => {
        document.getElementById('sidek').style.right = "-36em";
      })
    }

  }
function fillConcepts(outputArray) {
  outputArray.forEach(element => {
    const concept_hashtag_backdrop = document.createElement('div');
    concept_hashtag_backdrop.className = 'concept-hashtag-backdrop';
    const concept_hashtag = document.createElement('div');
    concept_hashtag.className = 'concept-hashtag';
    concept_hashtag.classList.add('glassify');
    const spanElement = document.createElement('span');
    spanElement.innerText = '+' + element;
    concept_hashtag.appendChild(spanElement);
    concept_hashtag_backdrop.appendChild(concept_hashtag);
    document.getElementById('hashtags-containerid').appendChild(concept_hashtag_backdrop)
  });
  }
function fillKeynotes(outputArray) {
  outputArray.forEach(element => {
    const concept_hashtag_backdrop = document.createElement('div');
    concept_hashtag_backdrop.className = 'concept-hashtag-backdrop';
    const concept_hashtag = document.createElement('div');
    concept_hashtag.className = 'concept-hashtag';
    concept_hashtag.classList.add('glassify');
    const spanElement = document.createElement('span');
    spanElement.innerText = '+' + element;
    concept_hashtag.appendChild(spanElement);
    concept_hashtag_backdrop.appendChild(concept_hashtag);
    document.getElementById('keynotes-containerid').appendChild(concept_hashtag_backdrop)
  });
  }


  
  function toggleSelection(element) {
    // Toggle selection status of an element
    if (selectedElements.includes(element)) {
      // Deselect the element
      element.classList.remove('selected');
      element.style.color = '#3f3f3f';
      selectedElements = selectedElements.filter(selected => selected !== element);
    } else {
      // Select the element
      element.classList.add('selected');
      element.style.color = 'red';
      selectedElements.push(element);
    }
  }
  
  function multipleDragListener(element) {
    element.draggable = true;
    element.addEventListener('mousedown', (event) => {
      if (!element.classList.contains('selected')) {
        // If the element is not selected, clear selection
        selectedElements.forEach(selected => selected.classList.remove('selected'));
        selectedElements = [];
        toggleSelection(element); // Select the clicked element
      }
  
      selectedElements.forEach(selected => {
        selected.classList.add('dragging');
      });
  
      // Calculate initial offsets for each selected element
      const initialOffsets = selectedElements.map(selected => {
        const rect = selected.getBoundingClientRect();
        return {
          element: selected,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top
        };
      });
  
      function onMouseMove(moveEvent) {
        selectedElements.forEach((selected, index) => {
          const { offsetX, offsetY } = initialOffsets[index];
          selected.style.left = moveEvent.clientX - offsetX + 'px';
          selected.style.top = moveEvent.clientY - offsetY + 'px';
        });
      }
  
      function onMouseUp() {
        selectedElements.forEach(selected => {
          selected.classList.remove('dragging');
        });
  
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
  
        selectedElements.forEach(selected => {
          const newPosition = {
            x: parseFloat(selected.style.left),
            y: parseFloat(selected.style.top),
          };
          // You might need to find the thoughtId here if needed
          updateThoughtPosition(selected.id, newPosition);
        });
      }
  
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }


function initiateDarkMode() {
  indexWrapper.style.backgroundColor = '#0B0000'
  indexWrapper.style.color = "#ffffff"
  //find a better way to not call this goddam thing so much
  Array.from(document.getElementsByClassName('thought')).forEach((elm) => {
    elm.style.color = '#ffffff';
  });
  floatingButtons.forEach((item)=> {
    item.classList.add('invert')
  })
  

}
  
  