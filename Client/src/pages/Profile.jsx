import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPhone, FaMapMarkerAlt,
  FaGithub, FaLinkedin, FaGlobe,
  FaEdit, FaSave, FaCamera,
  FaChartLine, FaTrophy
} from "react-icons/fa";

const Profile = ( ) => {

  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [interviews, setInterviews] = useState([]);


 
  useEffect(() => {
    axios.get("/user/profile").then(res => {
      setUser(res.data.user);
    });

    axios.get("/interview/history").then(res => {
      setInterviews(res.data.interviews); // 🔥 IMPORTANT
    });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("image", file);
  
    const res = await axios.post("/user/upload", formData);
  
    const imageUrl = res.data.imageUrl;
    const updated = { ...user, image: imageUrl };
    await axios.put("/user/profile", updated);
    setUser(updated);
};
  const saveProfile = async () => {
    try{
      await axios.put("/user/profile", user);
      setEdit(false);
    }catch(err){
      console.log("Profile updated error:",err);
    }
  };

  const completedCount = interviews.filter(
    (i) => i.status === "completed"
  ).length;

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-10">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex justify-between items-center">

          <div className="flex items-center gap-5">

            <div className="relative">
            <img
              src={
                user.image && user.image.startsWith("http")
                  ? user.image
                  : "https://ui-avatars.com/api/?name=" + user.name
              }
              className="w-20 h-20 rounded-full object-cover border border-white/20"
            />

              {edit && (
                <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full cursor-pointer text-xs">
                  <FaCamera />
                  <input hidden type="file" onChange={handleImage} />
                </label>
              )}
            </div>

            <div>
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-gray-500 text-sm mt-1">
                {user.bio || "Add a short bio about yourself"}
              </p>
            </div>

          </div>

          <button
            onClick={() => edit ? saveProfile() : setEdit(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {edit ? <FaSave /> : <FaEdit />}
            {edit ? "Save" : "Edit"}
          </button>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6">

          <Stat icon={<FaChartLine />} label="Credits" value={user.credits} />
          <Stat icon={<FaTrophy />} label="Plan" value={user.plan} />
          <Stat icon={<FaChartLine />} label="Interviews Done" value={completedCount} />

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* PERSONAL */}
          <Card title="Personal Information">
            <Field label="Phone Number" name="phone" value={user.phone} edit={edit} onChange={handleChange} icon={<FaPhone />} />
            <Field label="Location" name="location" value={user.location} edit={edit} onChange={handleChange} icon={<FaMapMarkerAlt />} />
          </Card>

          {/* ABOUT */}
          <Card title="About You">
            <label className="text-xs text-gray-400">Bio</label>
            <textarea
              disabled={!edit}
              name="bio"
              value={user.bio || ""}
              onChange={handleChange}
              placeholder="Write something about yourself..."
              className="w-full mt-1 p-4 bg-[#1F2937] rounded-xl border border-white/10 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </Card>

          {/* LINKS */}
          <Card title="Social Links">
            <Field label="GitHub" name="github" value={user.github} edit={edit} onChange={handleChange} icon={<FaGithub />} />
            <Field label="LinkedIn" name="linkedin" value={user.linkedin} edit={edit} onChange={handleChange} icon={<FaLinkedin />} />
            <Field label="Portfolio" name="portfolio" value={user.portfolio} edit={edit} onChange={handleChange} icon={<FaGlobe />} />
          </Card>

          {/* SKILLS */}
          <Card title="Skills" className="col-span-3">
            {edit ? (
              <>
                <label className="text-xs text-gray-400">
                  Add Skills (e.g. React, Node, MongoDB)
                </label>

                <input
                  placeholder="React, Node.js, MongoDB..."
                  value={user.skills?.join(",")}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      skills: e.target.value.split(",")
                    })
                  }
                  className="w-full mt-2 p-3 bg-[#1F2937] rounded-lg border border-white/5 placeholder-gray-500"
                />
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.skills?.length ? (
                  (user.skills || [])
                    .join(",") // agar already array hai toh safe
                    .split(/[,\s]+/) // comma ya space dono handle
                    .filter(Boolean)
                    .map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-sm rounded-full">
                        {s}
                      </span>
                    ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No skills added yet
                  </p>
                )}
              </div>
            )}
          </Card>

        </div>

      </div>
    </div>
  );
};

/* COMPONENTS */

const Stat = ({ icon, label, value }) => (
  <div className="bg-[#111827] border border-white/10 p-4 rounded-xl flex items-center gap-3">
    <div className="text-indigo-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <h3 className="text-lg font-semibold">{value}</h3>
    </div>
  </div>
);

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-[#111827] border border-white/10 rounded-xl p-5 ${className}`}>
    <h2 className="text-sm text-gray-400 mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, icon, name, value, onChange, edit }) => (
  <div>
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex items-center gap-3 mt-1 bg-[#1F2937] px-3 py-2 rounded-lg border border-white/5">
      <div className="text-gray-400">{icon}</div>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={!edit}
        className="bg-transparent w-full outline-none text-sm"
      />
    </div>
  </div>
);

export default Profile;
