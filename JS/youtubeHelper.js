const apiKey = 'AIzaSyDi_RbRSzNqU1niUabt0Nw4T7HI_7m2l4Q';

const { exec } = require('child_process');

async function curlXtract(vidId) {
    return new Promise((resolve, reject) => {
        const curlCommand = `curl -s -L https://www.youtube.com/watch?v=${vidId}`;

        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            }
            const match = /https:\/\/www\.youtube\.com\/api\/timedtext\?[^'"]+/.exec(stdout);
            if (match && match[0]) {
                const finalurl = decodeURI(match[0].replace(/\\u0026/g, '&'));
                console.log(finalurl);
                console.log('url to transcript');
                resolve(finalurl);
            } else {
                console.error('Timedtext URL not found in response.');
                reject('Timedtext URL not found in response.');
            }
        });
    });
}
 export function extractYouTubeId(input) {
  // Check if the input is a full YouTube URL
  if (input.includes('youtube.com/watch?v=')) {
      // Extract ID from full URL
      return input.match(/(?:\?|&)v=([a-zA-Z0-9_-]+)/)[1];
  } else if (input.includes('youtu.be/')) {
      // Extract ID from shortened URL format
      return input.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)[1];
  } else {
      // Assume the input is already a valid YouTube video ID
      return input;
  }
  }
  
  async function urlToTranscript(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        const cleanedText = data.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
                                .replace(/<\/text>/g, ' ')
                                .replace(/<text[^>]*>/g, '')
                                .replace('</transcript>', '');
        return cleanedText;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}


export async function getVideoInfo(vidId) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vidId}&key=${apiKey}`);
        const data = await response.json();
        const vidTitle = data.items[0].snippet.title;
        const channelTitle = data.items[0].snippet.channelTitle;
        const thumbnailUrl = data.items[0].snippet.thumbnails.standard.url;
        const rawTranscriptUrl = await curlXtract(vidId);
        const rawTranscript = await urlToTranscript(rawTranscriptUrl);
        return [vidTitle, channelTitle, thumbnailUrl, rawTranscript];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}



