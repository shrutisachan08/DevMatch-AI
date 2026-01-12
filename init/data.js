const posts = [
  {
    title: "Introduction to JavaScript",
    content: "JavaScript is the most popular language for web development. It can run in browsers and on servers using Node.js.",
    code: `console.log("Hello, World!");`,
    likes: 5,
  },
  {
    title: "Understanding Promises in JS",
    content: "Promises are used to handle asynchronous operations in JavaScript. They are better than callbacks.",
    code: `
        const fetchData = () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve('Data fetched!');
            }, 2000);
          });
        };
        
        fetchData().then(console.log);
      `,
    likes: 12,
  },
  {
    title: "CSS Flexbox Cheatsheet",
    content: "Flexbox makes it easy to layout items in rows or columns. Use 'display: flex' to start using Flexbox.",
    code: `
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `,
    likes: 7,
  },
  {
    title: "Simple Node.js Server",
    content: "This is how you create a basic server using Node.js without any framework.",
    code: `
        const http = require('http');
        
        const server = http.createServer((req, res) => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Hello from Node.js Server!');
        });
        
        server.listen(3000, () => {
          console.log('Server running at http://localhost:3000/');
        });
      `,
    likes: 20,
  },
  {
    title: "Python List Comprehensions",
    content: "List comprehensions provide a concise way to create lists in Python.",
    code: `
        squares = [x*x for x in range(10)]
        print(squares)
      `,
    likes: 15,
  },
  {
    title: "SQL Query to Select Users",
    content: "This SQL statement retrieves all users who are older than 18 years from the users table.",
    code: `
          SELECT * FROM users
          WHERE age > 18;
        `,
    likes: 9,
  },
  {
    title: "Simple Java HelloWorld Class",
    content: "This is the classic HelloWorld program in Java. Compile and run it using javac and java commands.",
    code: `
          public class HelloWorld {
            public static void main(String[] args) {
              System.out.println("Hello, Java World!");
            }
          }
        `,
    likes: 11,
  },
  {
    title: "Basic Bash Script Example",
    content: "This Bash script prints today's date and a welcome message.",
    code: `
          #!/bin/bash
          echo "Welcome!"
          echo "Today is $(date)"
        `,
    likes: 6,
  },
  {
    title: "React useState Hook Example",
    content: "This shows how to use the useState hook in a React functional component.",
    code: `
          import React, { useState } from 'react';
      
          function Counter() {
            const [count, setCount] = useState(0);
      
            return (
              <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                  Click me
                </button>
              </div>
            );
          }
      
          export default Counter;
        `,
    likes: 18,
  },
  {
    title: "TypeScript Interface Example",
    content: "This shows how to define and use an interface in TypeScript.",
    code: `
          interface User {
            name: string;
            age: number;
            isAdmin?: boolean;
          }
      
          const user1: User = {
            name: "Alice",
            age: 25
          };
      
          console.log(user1);
        `,
    likes: 13,
  },
];

module.exports = posts;