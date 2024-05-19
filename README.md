Huzaifa Rehan
Project 

Documentation: https://docs.google.com/document/d/1HvfAp2Wf0eBg9uygC3IyhUTfA5e_NIRjNQf4rD5M75A/edit?usp=sharing 

Read me:

To run this software clone the repo and run npm i to install all dependecies.

If you have open ai api key, export it in your current directory like this:

'Export <insert key>'

Then you can just run 'npm run dev' to start the application and the software should be loaded on localhost:4000.

A bit about the code:

I decided to use javascript as the main language with html/css. I use javascript to make the ejs files which were used in the backend as well as all the ejs files. The front end, which was the homepage, was done in html/css and was a bootstrap template I used. The dashboard was also a bootstrap template but I have changed it alot. The backend uses javascript to start a server locally and connects to the postgres database to retrieve all the data. I've also used a module called passport for user authentication to prevent unwanted users going to a page that is restricted to them. Everything after the login page is done is ejs as it pulls data through post requests from the backend and uses the data to display the data on the website. The 3 types of accounts are user, trainer and admin. While admin accounts can only be created through manually inputting the data in the database as I have asked the prof. While members and trainers can manually create their own accounts. THe back end was mainly done on node.js and express.js
