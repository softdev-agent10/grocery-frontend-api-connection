# Task Template - Frontend Assignment

## Task Title:  
(Provide a clear, concise title for the task, e.g., "Design Checkout Page UI").

## Description:  
Describe the task in detail.  
- If it is a UI design task, specify the layout, components, and interactions expected.  
- If it is a data fetching task, specify which API endpoints to call, what data to fetch, and how it should be displayed.

## Scope:  
- Clearly outline what is in scope (e.g., design only the header, or fetch product data and display in a list).
- If the task involves both UI and API, state that explicitly (e.g., "Design the form layout and also call the API to submit").

## Acceptance Criteria:  
Define what success looks like.  
- Example: "User can see a checkout form with real-time validation."  
- Example: "Data from the API populates a product list correctly."

## Assigned To:  
(Assign the specific team member responsible.)

## Deadline:  
(Insert the due date here, e.g., DD-MM-YYYY)


## Resources:  
List any supporting materials (e.g., Figma link, API documentation, design mockups).

## Technology Considerations:  
- If a new component is created, define reusable hooks, components, or styles.  
- If API fetching is involved, mention where it will be placed (e.g., in a service or hook).

## Scaling Plan (if needed):  
Explain how this can scale in the future—e.g., if you plan to break the feature out into a separate micro-frontend.



# Example

## Task Title: Design User Profile Page UI

## Description:  
We need a user profile page that displays user details, including avatar, name, email, and bio. The page should have a responsive layout, with an "Edit" button to update profile information and a section to display recent activity. The user data should be fetched from a backend API.

## Scope:  
- Design the profile page layout.
- Fetch user data from the API endpoint: /api/users/me.
- Display the user information once loaded.
- Ensure responsiveness on all devices.

## Acceptance Criteria:  
- User profile page loads user data via API and displays avatar, name, email, and bio.
- "Edit" button opens a modal (placeholder functionality for now).
- Loading state is displayed until API response is received.
- Layout is responsive across mobile, tablet, and desktop.

## Assigned To:  Mohammad Atif Hossain

## Deadline: 28-02-2026

## Resources:  
- Figma design mockup: [link to design]
- API documentation: The user data API is available at /api/users/me.
    Example response:
    ```json
    {
        "avatar": "url_to_image",
        "name": "Mohammad Atif Hossain",
        "email": "name@example.com",
        "bio": "Software Developer based in XYZ."
    }
    ```


## Technology Considerations:  
- Use the built-in useEffect hook to fetch the user data when the component mounts.
- Store the fetched data in state using React’s useState.
- Show a spinner or loading indicator while waiting for API response.

## Scaling Plan (if needed):  
Explain how this can scale in the future—e.g., if you plan to break the feature out into a separate micro-frontend.