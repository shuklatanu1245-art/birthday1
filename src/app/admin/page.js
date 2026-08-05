"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [surprises, setSurprises] = useState([]);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    senderName: "",
    relationType: "Friend",
    celebrationType: "Party",
    letterContent: "",
    friendPhoto: "",
    cakePhoto: "",
    customAudio: "",
    gallery: []
  });
  const [timelineInput, setTimelineInput] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCakePhoto, setUploadingCakePhoto] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSurprises();
  }, []);

  const fetchSurprises = () => {
    try {
      const stored = localStorage.getItem("localSurprises");
      if (stored) {
        setSurprises(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfile(true);
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("slug", formData.slug || "profiles");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const result = await res.json();
      if (result.url) {
        setFormData({ ...formData, friendPhoto: result.url });
        alert("Profile photo uploaded!");
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      alert("Error uploading profile photo. Check console.");
    }
    setUploadingProfile(false);
  };

  const handleCakePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCakePhoto(true);
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("slug", formData.slug || "caketoppers");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const result = await res.json();
      if (result.url) {
        setFormData({ ...formData, cakePhoto: result.url });
        alert("Cake photo uploaded!");
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading cake photo:", error);
      alert("Error uploading cake photo. Check console.");
    }
    setUploadingCakePhoto(false);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAudio(true);
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("slug", formData.slug || "audio");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const result = await res.json();
      if (result.url) {
        setFormData({ ...formData, customAudio: result.url });
        alert("Audio/Song uploaded!");
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Error uploading audio. Check console.");
    }
    setUploadingAudio(false);
  };

  const handleCreateSurprise = async (e) => {
    e.preventDefault();
    if (!formData.friendPhoto) {
      alert("Please upload a friend photo first!");
      return;
    }
    setLoading(true);
    try {
      const surpriseData = {
        id: Date.now().toString(),
        ...formData,
        gallery: [],
        createdAt: new Date().toISOString()
      };

      // Save to Cloudinary via our API route
      const res = await fetch("/api/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surpriseData),
      });

      const result = await res.json();
      if (res.ok) {
        // Save locally to show in the list
        const updatedSurprises = [surpriseData, ...surprises];
        setSurprises(updatedSurprises);
        localStorage.setItem("localSurprises", JSON.stringify(updatedSurprises));

        alert("Surprise created successfully!");
        setFormData({ slug: "", name: "", senderName: "", relationType: "Friend", celebrationType: "Party", letterContent: "", friendPhoto: "", cakePhoto: "", customAudio: "", gallery: [] });
      } else {
        alert("Error saving data: " + result.error);
      }
    } catch (error) {
      console.error("Error creating surprise: ", error);
      alert("Error creating surprise");
    }
    setLoading(false);
  };

  const handleImageUpload = async (e, surpriseId, slug) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImageId(surpriseId);
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("slug", slug);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      
      const result = await res.json();
      
      if (result.url) {
        // Update local list
        const targetSurprise = surprises.find(s => s.id === surpriseId);
        if (targetSurprise) {
          targetSurprise.gallery = [...(targetSurprise.gallery || []), result.url];
          
          // Resave updated json to Cloudinary
          await fetch("/api/save-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(targetSurprise),
          });

          // Update local state
          const newSurprises = surprises.map(s => s.id === surpriseId ? targetSurprise : s);
          setSurprises(newSurprises);
          localStorage.setItem("localSurprises", JSON.stringify(newSurprises));
          
          alert("Image uploaded and added to gallery!");
        }
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Check console.");
    }
    setUploadingImageId(null);
  };

  const handleAddTimeline = async (surpriseId) => {
    const item = timelineInput[surpriseId];
    if (!item || !item.title || !item.description) {
      alert("Please enter at least Title and Description for the milestone.");
      return;
    }

    const targetSurprise = surprises.find(s => s.id === surpriseId);
    if (!targetSurprise) return;

    targetSurprise.timeline = [...(targetSurprise.timeline || []), { ...item, year: item.year || "Milestone", emoji: item.emoji || "✨" }];

    try {
      await fetch("/api/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetSurprise),
      });

      const newSurprises = surprises.map(s => s.id === surpriseId ? targetSurprise : s);
      setSurprises(newSurprises);
      localStorage.setItem("localSurprises", JSON.stringify(newSurprises));
      setTimelineInput({ ...timelineInput, [surpriseId]: { year: "", title: "", description: "", emoji: "", photo: "" } });
      alert("Timeline milestone added successfully!");
    } catch (error) {
      console.error("Error adding timeline item:", error);
      alert("Failed to save timeline item.");
    }
  };

  const handleTimelinePhotoUpload = async (e, surpriseId, slug) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: could add uploading state here, but relying on alert for simplicity
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("slug", slug + "_timeline");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const result = await res.json();
      if (result.url) {
        setTimelineInput(prev => ({
          ...prev,
          [surpriseId]: { ...(prev[surpriseId] || {}), photo: result.url }
        }));
        alert("Memory photo uploaded! Now click Add to save the milestone.");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading memory photo.");
    }
  };

  const handleDeleteSurprise = async (id, slug) => {
    if (!confirm("Are you sure you want to delete this surprise? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch("/api/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      
      if (res.ok) {
        const newSurprises = surprises.filter(s => s.id !== id);
        setSurprises(newSurprises);
        localStorage.setItem("localSurprises", JSON.stringify(newSurprises));
        alert("Surprise deleted successfully!");
      } else {
        const result = await res.json();
        alert("Failed to delete: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting surprise:", error);
      alert("Error deleting surprise.");
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-midnight-blue p-6 md:p-8 text-white">
      <div className="flex justify-between items-center mb-8 border-b border-white/15 pb-4 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif text-gold-accent font-bold">👑 Admin Dashboard</h1>
        <a 
          href="/" 
          className="px-4 py-2 bg-white/10 hover:bg-gold-accent hover:text-midnight-blue text-white rounded-full text-xs md:text-sm font-bold border border-white/20 transition-all flex items-center space-x-2"
        >
          <span>🏠 Back to Home</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
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
              <label className="block text-sm mb-1">Friend Name (Kisko Wish Karna Hai)</label>
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
              <label className="block text-sm mb-1">Sender Name (Kis-ki Taraf Se Hai)</label>
              <input 
                type="text" 
                name="senderName" 
                value={formData.senderName} 
                onChange={handleChange} 
                required 
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white" 
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Friend Photo (Cloudinary)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleProfilePhotoUpload} 
                disabled={uploadingProfile || !formData.slug}
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-sm" 
              />
              {!formData.slug && <p className="text-xs text-royal-pink mt-1">Please enter slug first to upload photo.</p>}
              {uploadingProfile && <p className="text-xs text-gold-accent mt-1 animate-pulse">Uploading...</p>}
              {formData.friendPhoto && (
                <div className="mt-2 flex items-center space-x-3 bg-green-500/10 border border-green-500/30 p-2 rounded">
                  <img src={formData.friendPhoto} alt="Uploaded" className="w-10 h-10 object-cover rounded-full border border-green-400" />
                  <p className="text-sm font-bold text-green-400">✅ Photo Submitted!</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Upload Cake Image (Required - 2D Photo of the Cake)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleCakePhotoUpload} 
                disabled={uploadingCakePhoto || !formData.slug}
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-sm" 
              />
              {!formData.slug && <p className="text-xs text-royal-pink mt-1">Please enter slug first to upload cake photo.</p>}
              {uploadingCakePhoto && <p className="text-xs text-gold-accent mt-1 animate-pulse">Uploading cake photo...</p>}
              {formData.cakePhoto && (
                <div className="mt-2 flex items-center space-x-3 bg-green-500/10 border border-green-500/30 p-2 rounded">
                  <img src={formData.cakePhoto} alt="Cake Topper" className="w-10 h-10 object-cover rounded-full border border-green-400" />
                  <p className="text-sm font-bold text-green-400">✅ Cake Image Attached!</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Custom Background Song / Voice Note (Optional - MP3, M4A, MP4)</label>
              <input 
                type="file" 
                accept="audio/*,video/mp4,video/*"
                onChange={handleAudioUpload} 
                disabled={uploadingAudio || !formData.slug}
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-sm" 
              />
              {!formData.slug && <p className="text-xs text-royal-pink mt-1">Please enter slug first to upload song/audio.</p>}
              {uploadingAudio && <p className="text-xs text-gold-accent mt-1 animate-pulse">Uploading song/audio...</p>}
              {formData.customAudio && (
                <div className="mt-2 flex items-center space-x-3 bg-green-500/10 border border-green-500/30 p-2 rounded">
                  <span className="text-xl">🎵</span>
                  <p className="text-sm font-bold text-green-400 truncate max-w-[200px]">✅ Song/Audio Attached!</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Category (Relation)</label>
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
                <label className="block text-sm mb-1">Celebration Type</label>
                <select 
                  name="celebrationType" 
                  value={formData.celebrationType} 
                  onChange={handleChange} 
                  className="w-full bg-midnight-blue border border-white/20 rounded p-2 text-white"
                >
                  <option value="Party">Party</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Grand">Grand</option>
                  <option value="Quiet">Quiet</option>
                </select>
              </div>
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
              disabled={loading || uploadingProfile}
              className="w-full bg-gold-accent text-midnight-blue font-bold py-2 rounded hover:bg-white transition"
            >
              {loading ? "Creating..." : "Generate Surprise"}
            </button>
          </form>
        </div>

        {/* List of Generated Surprises */}
        <div className="glassmorphism p-6 h-fit max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Your Created Surprises</h2>
          {surprises.length === 0 ? (
            <p className="text-gray-400">No surprises created yet.</p>
          ) : (
            <ul className="space-y-4">
              {surprises.map((s) => (
                <li key={s.id} className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col space-y-3">
                  <div className="flex items-center space-x-4">
                    {s.friendPhoto && <img src={s.friendPhoto} alt={s.name} className="w-12 h-12 rounded-full object-cover border-2 border-gold-accent" />}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-royal-pink">{s.name} <span className="text-sm font-normal text-gray-400">({s.relationType} - {s.celebrationType})</span></h3>
                      <p className="text-sm text-gray-300 mt-1">Link: <a href={`/s/${s.slug}`} target="_blank" className="text-gold-accent hover:underline">/s/{s.slug}</a></p>
                      <p className="text-xs text-gray-400 mt-1">Photos in gallery: {s.gallery?.length || 0}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteSurprise(s.id, s.slug)}
                      disabled={deletingId === s.id}
                      className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded transition-colors"
                    >
                      {deletingId === s.id ? "Deleting..." : "Delete"}
                    </button>
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

                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <label className="block text-sm text-gray-300 font-semibold">Add Milestone to Memory Timeline</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="text" 
                        placeholder="Year/Tag (e.g. 2023)" 
                        value={timelineInput[s.id]?.year || ""} 
                        onChange={(e) => setTimelineInput({ ...timelineInput, [s.id]: { ...(timelineInput[s.id] || {}), year: e.target.value } })}
                        className="bg-white/10 border border-white/20 rounded p-1.5 text-xs text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Title (e.g. Goa Trip)" 
                        value={timelineInput[s.id]?.title || ""} 
                        onChange={(e) => setTimelineInput({ ...timelineInput, [s.id]: { ...(timelineInput[s.id] || {}), title: e.target.value } })}
                        className="bg-white/10 border border-white/20 rounded p-1.5 text-xs text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Emoji (e.g. ✈️)" 
                        value={timelineInput[s.id]?.emoji || ""} 
                        onChange={(e) => setTimelineInput({ ...timelineInput, [s.id]: { ...(timelineInput[s.id] || {}), emoji: e.target.value } })}
                        className="bg-white/10 border border-white/20 rounded p-1.5 text-xs text-white" 
                      />
                    </div>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Description (e.g. We danced under the stars all night...)" 
                        value={timelineInput[s.id]?.description || ""} 
                        onChange={(e) => setTimelineInput({ ...timelineInput, [s.id]: { ...(timelineInput[s.id] || {}), description: e.target.value } })}
                        className="flex-1 bg-white/10 border border-white/20 rounded p-1.5 text-xs text-white" 
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddTimeline(s.id)}
                        className="px-3 py-1 bg-gold-accent hover:bg-white text-midnight-blue font-bold text-xs rounded transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <label className="text-[10px] text-gray-400">Memory Photo (Optional):</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleTimelinePhotoUpload(e, s.id, s.slug)}
                        className="text-[10px] file:py-1 file:px-2 file:rounded file:border-0 file:bg-royal-pink file:text-white"
                      />
                      {timelineInput[s.id]?.photo && <span className="text-[10px] text-green-400">✅ Uploaded</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Current custom milestones: {s.timeline?.length || 0} (Default chapters shown if 0)</p>
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
