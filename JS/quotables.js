const { exec } = require('child_process');

async function quotablePerson(q) {
    const CUSTOM_SEARCH_API = "AIzaSyDi_RbRSzNqU1niUabt0Nw4T7HI_7m2l4Q"
    const cx = "01de08f8ec12e46dc"
    var url = `https://www.googleapis.com/customsearch/v1?key=${CUSTOM_SEARCH_API}&cx=${cx}&q=${q} quotes`
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        return data.items ? data.items.map(function (item) {
            return item.link;
        }) : [];
    } catch (error) {
        console.error('Error fetching search results:', error);
        return [];
    }
}


async function curlFetchWebsiteBody(url) {
    return new Promise((resolve, reject) => {
        const curlCommand = `curl -s -L ${url}`;

        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            
            // Extract content inside the body tag
            const bodyContentMatch = /<body[^>]*>([\s\S]*)<\/body>/gi.exec(stdout);
            const bodyContent = bodyContentMatch ? bodyContentMatch[1] : '';

            // Clean body content from script tags, noscript tags, style tags, and class attributes
            const cleanedHtml = bodyContent
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
                .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '') // Remove noscript tags
                .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                .replace(/<[^>]+>/g, '').replace(/^\s*[\r\n]/gm, '')


                ; 

            resolve(cleanedHtml);
        });
    });
}


export async function quotableFull(person) {
    try {
        const searchResults = await quotablePerson(person);
        const body = await curlFetchWebsiteBody(searchResults[0]);
        console.log(body);
        return body;
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}



// node --version # Should be >= 18
// npm install @google/generative-ai

// const {
//     GoogleGenerativeAI,
//     HarmCategory,
//     HarmBlockThreshold,
//   } = require("@google/generative-ai");
  
//   const MODEL_NAME = "gemini-1.0-pro";
//   const API_KEY = "AIzaSyDRCvlw7IwTavhxKSm815Mv_TXkzMWjrjc";
  
//   async function runQuoteGeneration() {
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
//     const generationConfig = {
//       temperature: 0.9,
//       topK: 0,
//       topP: 1,
//       maxOutputTokens: 2048,
//     };
  
//     const safetySettings = [
//       {
//         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//       },
//     ];
  
//     const parts = [
//       {text: "Role: You're a data scientist tasked with extracting meaningful quotes from a given text.\nMain Task: Provide the user with a curated list of quotes based on the provided text.\nSteps to complete the task:\n- Analyze the text and identify meaningful quotes or statements.\n- Extract these quotes or statements from the text.\n- Return the list of quotes in an Array format.\nConstraints: Maximum of 10 quotes if possible.\nIMPORTANT: The output should be an array. Make sure the format is valid.\nExample of a response:\n[\"Success is a lousy teacher. It seduces smart people into thinking they can’t lose.\", \"We all need people who will give us feedback. That’s how we improve.\", \"Patience is a key element of success.\"]\nText:"},
//       {text: "input: Start\n                            Everything that you need to know to start your own business.  From business ideas to researching the competition.\n                            Start\n                            Run\n                            Practical and real-world advice on how to run your business — from managing employees to keeping the books.\n                            Run\n                            Grow\n                            Our best expert advice on how to grow your business — from attracting new customers to keeping existing customers happy and having the capital to do it.\n                            Grow\n                            Good Company\n                            Entrepreneurs and industry leaders share their best advice on how to take your company to the next level.\n                            Good Company\n                                                            Subscribe\n                Subscribe to our Newsletter\n                Attend an Event\n                About Us\n                    CO— BrandStudio\n                    Looking for your local chamber?\n                    Chamber Finder\n                    Interested in partnering with us?\n                    Media Kit\n                                                                Start »                         Strategy\n                            10 Bill Gates Quotes Every Business Owner Needs to Hear\n                        Bill Gates has a lot of wisdom to share about how to build a successful business and how to give back. Here are 10 memorable Bill Gates quotes everyone should read.\n        By: \n                                                                Jamie Johnson\n                    , Contributor\n                    Share\n            From self-improvement inspiration to identifying and tackling problems, business owners can gain wisdom and motivation from Bill Gates. — pixelfit/Getty Images\n                                                Bill Gates is a businessman, philanthropist and co-founder of the Microsoft Corporation. Not only known just for his incredible contributions to technology, Gates is also recognized for his generosity and wisdom. \nHere are 10 Bill Gates quotes every business owner needs to hear — from running a company to being a good person overall. \n“Success is a lousy teacher. It seduces smart people into thinking they can’t lose.” \nEverybody wants to be successful, but Gates understood that there are dangers that come with success. Success can cause you to become complacent and neglect the things that made you successful in the first place. \n“We all need people who will give us feedback. That’s how we improve.”\nBill Gates frequently talks about the need for constant self-improvement. It’s important to have people in our lives who will give us honest, constructive feedback. This is the only way we can grow and become better. \n“Patience is a key element of success.”\nSuccess usually comes after a lot of trial and error and a lot of failures. Successful individuals are those who have the patience to stick through all the frustrating moments along the way. \n“The belief that the world is getting worse, that we can’t solve extreme poverty and disease, isn’t just mistaken. It’s harmful.”\nGates understands that even the most challenging problems have solutions and that if you’re in a position to help other people, then you should do so. That’s why he and his wife Melinda donated over $36 billion to charity.\n“Everyone needs a coach. It doesn't matter whether you're a basketball player, a tennis player, a gymnast, or a bridge player.\"\nWe can only improve so much on our own, which is why we need a coach or a mentor to help us. This is the best way to ensure you’re continuing to live up to your full potential.\n                We all need people who will give us feedback. That’s how we improve.\n                        Bill Gates\n                                                \"Don't compare yourself with anyone in this world ... if you do so, you are insulting yourself.\"\nWe all have unique gifts and our own ways of contributing to the greater good. By trying to copy someone else, you’re short-changing yourself and depriving the world of all you have to offer.\n “Your most unhappy customers are your greatest source of learning.”\nBill Gates recognized that problems were really opportunities and ways to improve. And, in business, unhappy customers have the most to teach you about how you can improve your products and services. \n“I can understand wanting to have millions of dollars, there’s a certain freedom, meaningful freedom, that comes with that. But once you get much beyond that, I have to tell you, it’s the same hamburger.”\nMost people want to be wealthy, but past a certain point, money isn’t going to increase your happiness or add more meaning to your life. That’s why Gates continues to give away much of his wealth to charitable contributions. \n“Television is not real life. In real life, people actually have to leave the coffee shop and go to jobs.” \nTelevision often makes starting and running a business seem easy and exciting, but it’s a lot of hard work. Don’t get caught up in the narrative around self-employment. It’s going to take a lot of discipline to make your dreams a reality. \n“It’s fine to celebrate success, but it is more important to heed the lessons of failure.”\nIt’s easy to get caught up in the excitement of success, but success on its own has very little to teach you. It’s important to pay attention to your failures and learn from them going forward. \nCO— aims to bring you inspiration from leading respected experts. However, before making any business decision, you should consult a professional who can advise you based on your individual situation.\nWant to read more? Be sure to follow us on LinkedIn!\n                                                                CO—is committed to helping you start, run and grow your small business. Learn more about the benefits of small business membership in the U.S. Chamber of Commerce, here.\n                    Brought to you by\n                    Simplify your startup’s finances with Mercury\n                    Navigating the complex finances of a growing startup can be daunting. Mercury’s VP of Finance shares the seven areas to focus on, from day-to-day operations to measuring performance, and more.\n                                                            Read the article\n                    Subscribe to our newsletter, Midnight Oil\n                    Expert business advice, news, and trends, delivered weekly\n                                    Email\n                            Subscribe\n                        By signing up you agree to the CO—\n                            Privacy Policy. You can opt out anytime. \n                            Published January 07, 2020\n                    More strategy tips\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStrategy\n\t\t\t\t\tHow Startups Contribute to Innovation in Emerging Industries\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStrategy\n\t\t\t\t\tHow Entrepreneurs Can Find a Business Mentor\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStrategy\n\t\t\t\t\t5 Business Metrics You Should Analyze Every Year\n        By continuing on our website, you agree to our use of cookies for statistical and personalisation purposes.\n            Know More\n        I Agree\n                        Welcome to CO—\n                        Designed for business owners, CO— is a site that connects like minds and delivers actionable insights for next-level growth.\n                                Contact\n                                    U.S. Chamber of Commerce\n                                    1615 H Street, NW\n                                    Washington, DC 20062\n                                Social links\n                                        Instagram\n                                        LinkedIn\n                                        Twitter\n                                        Facebook\n                                        Flipboard\n                                Looking for local chamber?\n                                Chamber Finder\n                                Stay In Touch\n                                Newsletter Sign Up\n                                Interested in partnering with us?\n                                Media\n                                    Kit\n                © 2024 CO— by U.S. Chamber of\n                    Commerce\n                         Contact\n                         About Us\n                         Privacy\n                         Terms\n                         Sitemap\n                         RSS\n                         Media Kit"},
//       {text: "output: [\n  \"Everything that you need to know to start your own business. From business ideas to researching the competition.\",\n  \"Practical and real-world advice on how to run your business — from managing employees to keeping the books.\",\n  \"Our best expert advice on how to grow your business — from attracting new customers to keeping existing customers happy and having the capital to do it.\",\n  \"Entrepreneurs and industry leaders share their best advice on how to take your company to the next level.\",\n  \"10 Bill Gates Quotes Every Business Owner Needs to Hear\",\n  \"Success is a lousy teacher. It seduces smart people into thinking they can’t lose.\",\n  \"We all need people who will give us feedback. That’s how we improve.\",\n  \"Patience is a key element of success.\",\n  \"The belief that the world is getting worse, that we can’t solve extreme poverty and disease, isn’t just mistaken. It’s harmful.\",\n  \"Everyone needs a coach. It doesn't matter whether you're a basketball player, a tennis player, a gymnast, or a bridge player.\",\n  \"Don't compare yourself with anyone in this world ... if you do so, you are insulting yourself.\",\n  \"Your most unhappy customers are your greatest source of learning.\",\n  \"I can understand wanting to have millions of dollars, there’s a certain freedom, meaningful freedom, that comes with that. But once you get much beyond that, I have to tell you, it’s the same hamburger.\",\n  \"Television is not real life. In real life, people actually have to leave the coffee shop and go to jobs.\",\n  \"It’s fine to celebrate success, but it is more important to heed the lessons of failure.\"\n]"},
//       {text: "input: Start\n                            Everything that you need to know to start your own business.  From business ideas to researching the competition.\n                            Start\n                            Run\n                            Practical and real-world advice on how to run your business — from managing employees to keeping the books.\n                            Run\n                            Grow\n                            Our best expert advice on how to grow your business — from attracting new customers to keeping existing customers happy and having the capital to do it.\n                            Grow\n                            Good Company\n                            Entrepreneurs and industry leaders share their best advice on how to take your company to the next level.\n                            Good Company\n                                                            Subscribe\n                Subscribe to our Newsletter\n                Attend an Event\n                About Us\n                    CO— BrandStudio\n                    Looking for your local chamber?\n                    Chamber Finder\n                    Interested in partnering with us?\n                    Media Kit\n                                                                Start »                         Strategy\n                            10 Bill Gates Quotes Every Business Owner Needs to Hear\n                        Bill Gates has a lot of wisdom to share about how to build a successful business and how to give back. Here are 10 memorable Bill Gates quotes everyone should read.\n        By: \n                                                                Jamie Johnson\n                    , Contributor\n                    Share\n            From self-improvement inspiration to identifying and tackling problems, business owners can gain wisdom and motivation from Bill Gates. — pixelfit/Getty Images\n                                                Bill Gates is a businessman, philanthropist and co-founder of the Microsoft Corporation. Not only known just for his incredible contributions to technology, Gates is also recognized for his generosity and wisdom. \nHere are 10 Bill Gates quotes every business owner needs to hear — from running a company to being a good person overall. \n“Success is a lousy teacher. It seduces smart people into thinking they can’t lose.” \nEverybody wants to be successful, but Gates understood that there are dangers that come with success. Success can cause you to become complacent and neglect the things that made you successful in the first place. \n“We all need people who will give us feedback. That’s how we improve.”\nBill Gates frequently talks about the need for constant self-improvement. It’s important to have people in our lives who will give us honest, constructive feedback. This is the only way we can grow and become better. \n“Patience is a key element of success.”\nSuccess usually comes after a lot of trial and error and a lot of failures. Successful individuals are those who have the patience to stick through all the frustrating moments along the way. \n“The belief that the world is getting worse, that we can’t solve extreme poverty and disease, isn’t just mistaken. It’s harmful.”\nGates understands that even the most challenging problems have solutions and that if you’re in a position to help other people, then you should do so. That’s why he and his wife Melinda donated over $36 billion to charity.\n“Everyone needs a coach. It doesn't matter whether you're a basketball player, a tennis player, a gymnast, or a bridge player.\"\nWe can only improve so much on our own, which is why we need a coach or a mentor to help us. This is the best way to ensure you’re continuing to live up to your full potential.\n                We all need people who will give us feedback. That’s how we improve.\n                        Bill Gates\n                                                \"Don't compare yourself with anyone in this world ... if you do so, you are insulting yourself.\"\nWe all have unique gifts and our own ways of contributing to the greater good. By trying to copy someone else, you’re short-changing yourself and depriving the world of all you have to offer.\n “Your most unhappy customers are your greatest source of learning.”\nBill Gates recognized that problems were really opportunities and ways to improve. And, in business, unhappy customers have the most to teach you about how you can improve your products and services. \n“I can understand wanting to have millions of dollars, there’s a certain freedom, meaningful freedom, that comes with that. But once you get much beyond that, I have to tell you, it’s the same hamburger.”\nMost people want to be wealthy, but past a certain point, money isn’t going to increase your happiness or add more meaning to your life. That’s why Gates continues to give away much of his wealth to charitable contributions. \n“Television is not real life. In real life, people actually have to leave the coffee shop and go to jobs.” \nTelevision often makes starting and running a business seem easy and exciting, but it’s a lot of hard work. Don’t get caught up in the narrative around self-employment. It’s going to take a lot of discipline to make your dreams a reality. \n“It’s fine to celebrate success, but it is more important to heed the lessons of failure.”\nIt’s easy to get caught up in the excitement of success, but success on its own has very little to teach you. It’s important to pay attention to your failures and learn from them going forward. \nCO— aims to bring you inspiration from leading respected experts. However, before making any business decision, you should consult a professional who can advise you based on your individual situation.\nWant to read more? Be sure to follow us on LinkedIn!\n                                                                CO—is committed to helping you start, run and grow your small business. Learn more about the benefits of small business membership in the U.S. Chamber of Commerce, here.\n                    Brought to you by\n                    Simplify your startup’s finances with Mercury\n                    Navigating the complex finances of a growing startup can be daunting. Mercury’s VP of Finance shares the seven areas to focus on, from day-to-day operations to measuring performance, and more.\n                                                            Read the article\n                    Subscribe to our newsletter, Midnight Oil\n                    Expert business advice, news, and trends, delivered weekly\n                                    Email\n                            Subscribe\n                        By signing up you agree to the CO—\n                            Privacy Policy. You can opt out anytime. \n                            Published January 07, 2020\n                    More strategy tips\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStrategy\n\t\t\t\t\tHow Startups Contribute to Innovation in Emerging Industries\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStrategy\n\t\t\t\t\tHow Entrepreneurs Can Find a Business Mentor\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStrategy\n\t\t\t\t\t5 Business Metrics You Should Analyze Every Year\n        By continuing on our website, you agree to our use of cookies for statistical and personalisation purposes.\n            Know More\n        I Agree\n                        Welcome to CO—\n                        Designed for business owners, CO— is a site that connects like minds and delivers actionable insights for next-level growth.\n                                Contact\n                                    U.S. Chamber of Commerce\n                                    1615 H Street, NW\n                                    Washington, DC 20062\n                                Social links\n                                        Instagram\n                                        LinkedIn\n                                        Twitter\n                                        Facebook\n                                        Flipboard\n                                Looking for local chamber?\n                                Chamber Finder\n                                Stay In Touch\n                                Newsletter Sign Up\n                                Interested in partnering with us?\n                                Media\n                                    Kit\n                © 2024 CO— by U.S. Chamber of\n                    Commerce\n                         Contact\n                         About Us\n                         Privacy\n                         Terms\n                         Sitemap\n                         RSS\n                         Media Kit"},
//       {text: "output: "},
//     ];
  
//     const result = await model.generateContent({
//       contents: [{ role: "user", parts }],
//       generationConfig,
//       safetySettings,
//     });
  
//     const response = result.response;
//     console.log(response.text());
//   }
  



