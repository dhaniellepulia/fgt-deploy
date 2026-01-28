//Dashboard > Project > Project Details
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../components/layouts/TopBar.jsx";
import { fetchProjectById } from "../api/projects";
import { useAuth } from "../auth/AuthContext";

function formatDate(value) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchProjectById(id, token);
        if (mounted) {
          setProject(res.item);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load project");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (token) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [id, token]);

  const details = useMemo(() => {
    if (!project) return [];
    return [
      {
        label: "DURATION",
        value: project.durationMinutes
          ? `${project.durationMinutes} minutes`
          : "N/A",
      },
      {
        label: "MAX RESPONSES",
        value: project.maxResponses ?? "N/A",
      },
      {
        label: "STARTS",
        value: formatDate(project.startsAt),
      },
      {
        label: "ENDS",
        value: formatDate(project.endsAt),
      },
      {
        label: "STATUS",
        value: project.status || "N/A",
      },
    ];
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen text-gray-300">
        <p className="text-sm text-neutral-400">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-300  ">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-white text-2xl">
            Projects <span className="text-[#F9B71E]">{" > "} </span>
            {project.title}
          </h3>
        </div>
        <TopBar />
      </header>
      <div className=" grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-8 mb-8">
            <button className="pb-4 text-[#F9B71E] border-b-2 border-[#F9B71E] font-semibold">
              Overview
            </button>
            <button className="pb-4 text-gray-500 hover:text-white transition font-semibold">
              Sessions
            </button>
          </div>
          <div className=" bg-[#252525] rounded-2xl p-8">
            <section className="mb-10 ">
              <h2 className="text-xl font-bold text-white mb-6">
                Project Description
              </h2>
              <div className="space-y-2">
                {details.map((item, index) => (
                  <div
                    key={index}
                    className="flex border border-gray-600 rounded-md overflow-hidden"
                  >
                    <div className="w-1/3 bg-[#2a2a2a] px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="w-2/3 bg-[#1e1e1e] px-4 py-3 text-sm text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-6">Evolution</h2>
              <div className="flex border border-gray-600 rounded-md overflow-hidden">
                <div className="w-1/3 bg-[#2a2a2a] px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  STATUS
                </div>
                <div className="w-2/3 bg-[#1e1e1e] px-4 py-3 text-sm text-white">
                  {project.status || "N/A"}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Sidebar Card */}
        <div className="bg-[#252525] rounded-2xl p-8 flex flex-col h-fit">
          <h3 className="text-2xl font-bold text-white mb-4">
            {project.title}
          </h3>

          {/* Placeholder for Image */}
          <div className="aspect-square bg-[#333333] border border-gray-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gray-600 rotate-45"></div>
              <div className="w-full h-px bg-gray-600 -rotate-45"></div>
            </div>
          </div>

          <div className="text-xs text-orange-400 mb-6 flex items-center gap-2">
            <span>Status {project.status || "N/A"}</span>
          </div>

          <div className="text-sm leading-relaxed text-gray-400 mb-6">
            <p className="mb-4">{project.description || "No description."}</p>
          </div>

          <button
            onClick={() => navigate(`/projects/${id}/test`)}
            className="mt-auto w-full bg-[#4c28a5] hover:bg-[#5d35c2] text-white py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg"
          >
            Start Playtest
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
