"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";

export default function AdminDashboard() {
  const [surprises, setSurprises] = useState([]);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    relationType: "Friend",
    letterContent: "",
    gallery: []
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState(null);

  useEffect(() => {
    fetchSurprises();
  }, []);

  const fetchSurprises = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "surprises"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSurprises(data);
    } catch (error) {
      console.error("Error fetching surprises:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSurprise = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "surprises"), {
        ...formData,
        gallery: [],
        createdAt: new Date().toISOString()
      });
      alert("Surprise created successfully!");
      setFormData({ slug: "", name: "", relationType: "Friend", letterContent: "", gallery: [] });
      fetchSurprises();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error creating surprise");
    }
    setLoading(false);
  };

  const handleImageUpload = async (e, surpriseId, slug) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImageId(surpriseId);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);

    try {
      // Upload to Cloudinary via our API route
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const result = await res.json();
      
      if (result.url) {
        // Update Firestore document with new image URL
        const surpriseRef = doc(db, "surprises", surpriseId);
        await updateDoc(surpriseRef, {
          gallery: arrayUnion(result.url)
        });
        alert("Image uploaded and added to gallery!");
        fetchSurprises();
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image.");
    }
    setUploadingImageId(null);
  };

  return (
    <div className="min-h-screen bg-midnight-blue p-8 text-white">
      <h1 className="text-4xl font-serif text-gold-accent mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Form */}
        <div className="glassmorphism p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Surprise</h2>
          <form onSubmit={handleCreateSurprise} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Unique Link Name (slug, e.g. "aditi")</label>
              <input 
                type="text" 
                name="slug" 
                value={formData.slug} 
                onChange={handleChange} 
                required 
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" 
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Relation Type</label>
              <select 
                name="relationType" 
                value={formData.relationType} 
                onChange={handleChange} 
                className="w-full bg-midnight-blue border border-white/20 rounded p-2 text-white"
              >
                <option value="Friend">Friend</option>
                <option value="Girlfriend">Girlfriend</option>
                <option value="Boyfriend">Boyfriend</option>
                <option value="Family">Family</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Personal Letter</label>
              <textarea 
                name="letterContent" 
                value={formData.letterContent} 
                onChange={handleChange} 
                rows="4" 
                required 
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gold-accent text-midnight-blue font-bold py-2 rounded hover:bg-white transition"
            >
              {loading ? "Creating..." : "Generate Surprise"}
            </button>
          </form>
        </div>

        {/* List of Generated Surprises */}
        <div className="glassmorphism p-6">
          <h2 className="text-2xl font-bold mb-4">Your Created Surprises</h2>
          {surprises.length === 0 ? (
            <p className="text-gray-400">No surprises created yet.</p>
          ) : (
            <ul className="space-y-4">
              {surprises.map((s) => (
                <li key={s.id} className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-royal-pink">{s.name} <span className="text-sm font-normal text-gray-400">({s.relationType})</span></h3>
                    <p className="text-sm text-gray-300 mt-1">Link: <a href={`/s/${s.slug}`} target="_blank" className="text-gold-accent hover:underline">/s/{s.slug}</a></p>
                    <p className="text-xs text-gray-400 mt-1">Photos in gallery: {s.gallery?.length || 0}</p>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3">
                    <label className="block text-sm mb-2 text-gray-300">Add Photo to Gallery (Cloudinary)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, s.id, s.slug)}
                      disabled={uploadingImageId === s.id}
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-royal-pink file:text-white hover:file:bg-pink-600"
                    />
                    {uploadingImageId === s.id && <span className="text-gold-accent text-sm ml-2 animate-pulse">Uploading...</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
