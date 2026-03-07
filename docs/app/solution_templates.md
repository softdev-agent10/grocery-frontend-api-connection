# Solution for Task: [Task Name]

- **Branch Name**:  
  Insert your branch name following this pattern: `feature/<your-branch-name>`

- **Description**:  
  Provide a detailed description of the solution you implemented. What problem does it solve? How does it meet the task requirements?

- **Approach**:  
  Describe the steps you took to implement the solution.  
  - What tools or libraries did you use?  
  - How did you organize your code?  
  - Did you follow any design patterns or best practices?

- **Challenges**:  
  Explain any difficulties you encountered.  
  - What was the problem?  
  - How did you resolve it or what did you learn?

- **Next Steps**:  
  Outline any future work or improvements you plan to make.  
  - Is there something else that needs to be added?  
  - Are there follow-up tasks or validations?



# Solution for Task: Design User Profile Page UI

- **Branch Name**: feature/user-profile
- **Description**:  
  I implemented a responsive user profile page that displays the user’s avatar, name, email, and bio. The data is fetched from the `/api/users/me` endpoint.

- **Approach**:  
  - Used React hooks (`useState`, `useEffect`) to fetch user data when the component mounts.  
  - Styled the page using our design system components.  
  - Added a loading spinner while waiting for the API response.

- **Challenges**:  
  The API response was delayed initially due to CORS. I resolved this by ensuring the API allowed cross-origin requests.

- **Next Steps**:  
  After approval, I will implement the "Edit" modal functionality and handle profile updates via a new API endpoint.