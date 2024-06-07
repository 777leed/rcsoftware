const OpenAI = require('openai');



export async function geminiReplies(promptNumber,space,transcript,customPrompt) {
    const openai = new OpenAI({
        apiKey: 'sk-proj-3aNWwMdPrmSK0ie44eNeT3BlbkFJ3ZP34wvQ3iLeWLHddbD9',
        dangerouslyAllowBrowser: true
      });
    const flowerLoader = document.createElement('div');
    flowerLoader.className = 'flower-loader';
    document.getElementById('indexWrapper').appendChild(flowerLoader);
    let promptTxt = await checkAndGetPrompt(promptNumber);
    
    if (promptNumber === 3) {
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                "role": "system",
                "content": `${promptTxt}`
              },
              {
                "role": "user",
                "content": `${transcript}`
              }
            ],
            temperature: 0.7,
            max_tokens: 200,
            top_p: 1,
          });

        flowerLoader.remove()
        return response.choices[0].message.content; 
        
    }
    else if (promptNumber === 4) {
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                "role": "system",
                "content": `${promptTxt}`
              },
              {
                "role": "user",
                "content": `${transcript}`
              }
            ],
            temperature: 0.7,
            max_tokens: 200,
            top_p: 1,
          });
        flowerLoader.remove()
        return response.choices[0].message.content; 
    }
    
    else {
        if (space.thoughtList && space.thoughtList.length > 0) {
            let numberedString = '';
            space.thoughtList.forEach((thought, index) => {
                numberedString += `${index + 1}. ${thought.text}\n`;
            });
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    "role": "system",
                    "content": `${promptTxt}`
                  },
                  {
                    "role": "user",
                    "content": `${customPrompt + numberedString}`
                  }
                ],
                temperature: 0.7,
                max_tokens: 200,
                top_p: 1,
              });
            flowerLoader.remove()
            return response.choices[0].message.content;
          }
          else {
              return 'No Thoughts Have Been Found..'
          }
    }

}

async function checkAndGetPrompt(promptNumber) {
        let url;
        if (promptNumber === 1) {
            url = "../Text/getConceptsPrompt.txt";
        } else if (promptNumber === 2) {
            url = "../Text/getSummaryPrompt.txt";
        }
        else if(promptNumber === 3){
            url = "../Text/getVidSummaryPrompt.txt";

        }
        else if (promptNumber === 5) {
          url = "../Text/getCustomPrompt.txt";
        }
        else {
            url = "../Text/getQuotesPrompt.txt";
        }
    
        try {
            const res = await fetch(url);
            const text = await res.text();
            return text;
        } catch (e) {
            return console.error(e);
        }
}
    
  
export async function performSearchAndReturnLinks(query) {
    var apiKey = 'AIzaSyBTeNmd_NhI3bexlNBRagD0KU1YKH_n1Vo';
    var cx = '805e28d7ed95f443b';
    var typeSearch = 'image';
    var url = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey + '&cx=' + cx + '&q=' + query + '&searchType=' + typeSearch + '&imgType=clipart&imgColorType=trans';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.items ? data.items.map(function (item) {
            return item.link;
        }) : [];
    } catch (error) {
        console.error('Error fetching search results:', error);
        return [];
    }
  }


export function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

export function jsonExporter(space) {
    return JSON.stringify(space);
}



