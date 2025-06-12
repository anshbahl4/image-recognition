import React, { useState } from 'react';
import AWS from 'aws-sdk';
import './App.css';


AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:f5c550d6-12c4-4194-b8a5-50038e28818b', 
});

const s3 = new AWS.S3();

function App() {
  const [file, setFile] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadFile = () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);

    
    AWS.config.credentials.refresh((err) => {
      if (err) {
        console.error('Credential refresh error:', err);
        alert('AWS credentials error');
        setLoading(false);
      } else {
        const params = {
          Bucket: 'image-upload-bucket-7', 
          Key: file.name,
          Body: file,
          ContentType: file.type,
        };

        s3.upload(params, (err, data) => {
          if (err) {
            console.error('Upload error', err);
            alert('Upload failed');
          } else {
            console.log('Upload success', data);
            
            setTimeout(() => fetchLabels(file.name), 5000);
          }
          setLoading(false);
        });
      }
    });
  };

  const fetchLabels = async (imageName) => {
    try {
      const res = await fetch(`https://ck2ycs2yu5.execute-api.us-east-1.amazonaws.com/labels/${imageName}`);
      const data = await res.json();
      setLabels(data.labels || []);
    } catch (err) {
      console.error('Error fetching labels:', err);
      alert('Could not fetch labels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Image Label Recognition</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <button onClick={uploadFile}>Upload</button>

      {loading && <p>⏳ Processing image, please wait...</p>}

      {labels.length > 0 && (
        <div className="labels">
          <h3>Detected Labels:</h3>
          <ul>
            {labels.map((label, idx) => (
              <li key={idx}>{label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
