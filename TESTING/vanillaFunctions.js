import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Fetch your API_KEY
const API_KEY = "AIzaSyDRCvlw7IwTavhxKSm815Mv_TXkzMWjrjc";
// const API_KEY = "AIzaSyDzYqr6tYrGR2Rq1KCYVpNJXCkgKh-iPpc";
// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);
const safetySettings = [
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
    }
    ,
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_UNSPECIFIED",
        "threshold": "BLOCK_NONE",
        
    }
];

export async function geminiReplies(promptNumber,space,transcript) {
    const flowerLoader = document.createElement('div');
    flowerLoader.className = 'flower-loader';
    document.getElementById('indexWrapper').appendChild(flowerLoader);
    let promptTxt = await checkAndGetPrompt(promptNumber);
    if (promptNumber === 3) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        
        const prompt = promptTxt + transcript;
        const result = await model.generateContent(prompt,{ safetySettings });
        const response = await result.response;
        flowerLoader.remove()
        return response.text(); 
        
    }
    else if (promptNumber === 4) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        
        const prompt = promptTxt + transcript;
        const result = await model.generateContent(prompt,{ safetySettings });
        const response = await result.response;
        flowerLoader.remove()
        return response.text(); 
    }
    
    else {
        if (space.thoughtList && space.thoughtList.length > 0) {
            let numberedString = '';
            space.thoughtList.forEach((thought, index) => {
                numberedString += `${index + 1}. ${thought.text}\n`;
            });
            const model = genAI.getGenerativeModel({ model: "gemini-pro"});
            const prompt = promptTxt + numberedString
            const result = await model.generateContent(prompt,{ safetySettings });
            const response = await result.response;
            flowerLoader.remove()
            return response.text();
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


async function gptReplies(){

const openai = new OpenAI({
  apiKey: 'sk-proj-3aNWwMdPrmSK0ie44eNeT3BlbkFJ3ZP34wvQ3iLeWLHddbD9',
});
url = "../Text/getConceptsPrompt.txt";
const res = await fetch(url);
const text = await res.text();

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      "role": "system",
      "content": `${text}`
    },
    {
      "role": "user",
      "content": "def foo(n, k):\n        accum = 0\n        for i in range(n):\n            for l in range(k):\n                accum += i\n        return accum"
    }
  ],
  temperature: 0.7,
  max_tokens: 64,
  top_p: 1,
});
}

