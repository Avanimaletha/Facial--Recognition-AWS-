import React, { useState } from "react";
import './styles.css';
import { v4 as uuidv4 } from "uuid";


function App() {
  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate.');
  const [visitorName, setVisitorName] = useState('placeholder.jpeg');
  const [isAuth, setAuth] = useState(false);

  // Function to handle image upload
  async function sendImage(e) {
    e.preventDefault();

    if (!image) {
      setUploadResultMessage('No image selected. Please choose an image to authenticate.');
      return;
    }

    setVisitorName(image.name);
    const visitorImageName = uuidv4(); // Generate a unique name for the uploaded image

    try {
      // Upload the image to the server (S3 bucket)
      await fetch(`/*url from API Gateway*/${visitorImageName}.jpeg`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: image,
      });

      // Call authentication API
      const response = await authenticate(visitorImageName);

      if (response.Message === 'Success') {
        setAuth(true);
        setUploadResultMessage(`Hi ${response.firstName} ${response.lastName}, Welcome to work. Hope you have a nice day!`);
      } else {
        setAuth(false);
        setUploadResultMessage('Authentication Failed: This person is not an employee.');
      }
    } catch (error) {
      setAuth(false);
      setUploadResultMessage('There was an error during the authentication process. Please try again.');
      console.error(error);
    }
  }

  // Function to handle authentication
  async function authenticate(visitorImageName) {
    const requestUrl = `xyz?${new URLSearchParams({ objectKey: `${visitorImageName}.jpeg` })}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return { Message: 'Failed to authenticate' };
    }
  }

  return (
    <div className="App">
      <h2>Facial Recognition System</h2>
      <form onSubmit={sendImage}>
        <input
          type="file"
          name="image"
          onChange={e => setImage(e.target.files[0])} // Corrected access to the file
        />
        <button type="submit">Authenticate</button>
      </form>

      <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>

      <img
        src={require(`./visitors/${visitorName}`)} // Display visitor image
        alt="visitor"
        height={250}
        width={250}
      />
    </div>
  );
}

export default App;
