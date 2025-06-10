import React, { useState } from 'react';
import AWS from 'aws-sdk';
import './App.css';

// AWS Configuration
AWS.config.update({
  region: 'us-east-1', // ✅ Replace with your actual region
  credentials: new AWS.Credentials('ACCESS_KEY', 'SECRET_KEY'), // 🔐 Replace with your credentials or use Cognito/Amplify in production
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

    const params = {
      Bucket: 'image-upload-bucket', // ✅ Replace with your actual bucket name
      Key: file.name,
      Body: file,
      ContentType: file.type,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Upload error', err);
        setLoading(false);
        alert('Upload failed');
      } else {
        console.log('Upload success', data);
        // Wait for labels to be processed in backend
        setTimeout(() => fetchLabels(file.name), 5000);
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
