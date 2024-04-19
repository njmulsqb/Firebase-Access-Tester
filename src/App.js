import "./App.css";
import { useState } from "react";
import { storage } from "./firebase";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  listAll,
  deleteObject,
} from "firebase/storage";

function App() {
  const [imgUrl, setImgUrl] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [deleteFileName, setDeleteFileName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = e.target[0]?.files[0];
    if (!file) return;
    const storageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgressPercent(progress);
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgUrl(downloadURL);
        });
      }
    );
  };

  const handleDownloadAllContent = () => {
    const storageRef = ref(storage, "files/");

    listAll(storageRef)
      .then((res) => {
        res.items.forEach((itemRef) => {
          getDownloadURL(itemRef)
            .then((downloadURL) => {
              console.log("Downloading:", downloadURL);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error listing items:", error);
      });
  };

  const handleDeleteFile = () => {
    const fileRef = ref(storage, `files/${deleteFileName}`);
    deleteObject(fileRef)
      .then(() => {
        console.log(`${deleteFileName} deleted successfully`);
        setDeleteFileName("");
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit} className="form">
        <input type="file" />
        <button type="submit">Upload</button>
      </form>
      <button onClick={handleDownloadAllContent}>Download All Content</button>
      <div className="delete-file">
        <input
          type="text"
          value={deleteFileName}
          onChange={(e) => setDeleteFileName(e.target.value)}
          placeholder="Enter filename to delete"
        />
        <button onClick={handleDeleteFile}>Delete File</button>
      </div>
      {!imgUrl && (
        <div className="progress-bar">
          <div className="inner-bar" style={{ width: `${progressPercent}%` }}>
            {progressPercent}%
          </div>
        </div>
      )}
      {imgUrl && <img src={imgUrl} alt="uploaded file" height={200} />}
    </div>
  );
}

export default App;
