import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentTab, setCurrentTab] = useState("All Projects");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    deadline: "",
    team: [],
    progress: 0,
    status: "Not Started",
    description: "",
    priority: "Medium",
  });

  const [taskForm, setTaskForm] = useState({
    employeeId: "",
    description: "",
  });

  const statusOptions = [
    "Not Started",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ];
  const priorityOptions = ["Low", "Medium", "High", "Critical"];
  const tabs = [
    "All Projects",
    "Not Started",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [currentTab, page]);

  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.get(
        "https://backend-6bli.onrender.com/admin/employees",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmployees(response.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to fetch employees: " + err.message);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const params = {
        page,
        limit: 10,
        status: currentTab === "All Projects" ? undefined : currentTab,
        search: search || undefined,
      };

      const response = await axios.get(
        "https://backend-6bli.onrender.com/admin/projects",
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProjects(response.data.projects || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects");
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    if (!projectId) {
      setError("Invalid project ID");
      setTasks([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      console.log("Fetching tasks for project ID:", projectId);
      const response = await axios.get(
        `https://backend-6bli.onrender.com/admin/projects/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Tasks response:", response.data);
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Tasks endpoint not found or project does not exist."
          : err.response?.data?.message || "Failed to fetch tasks";
      setError(errorMessage);
      setTasks([]);
      toast.error(errorMessage, {
        style: { backgroundColor: "white", color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditProject(project._id);
      setForm({
        name: project.name,
        startDate: new Date(project.startDate).toISOString().split("T")[0],
        deadline: new Date(project.deadline).toISOString().split("T")[0],
        team: project.team.map((member) => member._id || member),
        progress: project.progress,
        status: project.status,
        description: project.description || "",
        priority: project.priority || "Medium",
      });
    } else {
      setEditProject(null);
      setForm({
        name: "",
        startDate: "",
        deadline: "",
        team: [],
        progress: 0,
        status: "Not Started",
        description: "",
        priority: "Medium",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.startDate ||
      !form.deadline ||
      form.team.length === 0
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (new Date(form.startDate) >= new Date(form.deadline)) {
      setError("Deadline must be after start date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const projectData = {
        ...form,
        progress: Number(form.progress),
      };

      if (editProject) {
        await axios.put(
          `https://backend-6bli.onrender.com/admin/projects/${editProject}`,
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Project updated successfully!", {
          style: { backgroundColor: "white", color: "#113a69" },
        });
      } else {
        await axios.post(
          "https://backend-6bli.onrender.com/admin/projects",
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Project created successfully!", {
          style: { backgroundColor: "white", color: "#113a69" },
        });
      }

      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project");
      toast.error(err.response?.data?.message || "Failed to save project", {
        style: { backgroundColor: "white", color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.delete(
        `https://backend-6bli.onrender.com/admin/projects/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Project deleted successfully!", {
        style: { backgroundColor: "white", color: "#113a69" },
      });
      fetchProjects();
      if (selectedProject?._id === id) {
        setSelectedProject(null);
        setTasks([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
      toast.error(err.response?.data?.message || "Failed to delete project", {
        style: { backgroundColor: "white", color: "red" },
      });
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.patch(
        `https://backend-6bli.onrender.com/admin/projects/${projectId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProjects();
      if (selectedProject?._id === projectId) {
        setSelectedProject((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
      toast.error(err.response?.data?.message || "Failed to update status", {
        style: { backgroundColor: "white", color: "red" },
      });
    }
  };

  const handleProgressChange = async (projectId, newProgress) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.patch(
        `https://backend-6bli.onrender.com/admin/projects/${projectId}/progress`,
        { progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProjects();
      if (selectedProject?._id === projectId) {
        setSelectedProject((prev) => ({ ...prev, progress: newProgress }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update progress");
      toast.error(err.response?.data?.message || "Failed to update progress", {
        style: { backgroundColor: "white", color: "red" },
      });
    }
  };

  const handleAddTask = async () => {
    if (!taskForm.employeeId || !taskForm.description) {
      setError("Please select an employee and enter a task description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      await axios.post(
        `https://backend-6bli.onrender.com/admin/projects/${selectedProject._id}/tasks`,
        taskForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Task added successfully!", {
        style: { backgroundColor: "white", color: "#113a69" },
      });
      setShowTaskModal(false);
      setTaskForm({ employeeId: "", description: "" });
      fetchTasks(selectedProject._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add task");
      toast.error(err.response?.data?.message || "Failed to add task", {
        style: { backgroundColor: "white", color: "red" },
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamMember = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.includes(employeeId)
        ? prev.team.filter((id) => id !== employeeId)
        : [...prev.team, employeeId],
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      "Not Started": "bg-gray-100 text-gray-700",
      "In Progress": "bg-blue-100 text-blue-700",
      "On Hold": "bg-yellow-100 text-yellow-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || colors["Not Started"];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-gray-100 text-gray-700",
      Medium: "bg-blue-100 text-[#113a69]",
      High: "bg-orange-100 text-orange-700",
      Critical: "bg-red-100 text-red-700",
    };
    return colors[priority] || colors["Medium"];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleProjectClick = (project) => {
    if (!project?._id) {
      setError("Invalid project selected");
      setTasks([]);
      return;
    }
    console.log("Selected project ID:", project._id);
    setSelectedProject(project);
    fetchTasks(project._id);
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#113a69]">
              Project Management
            </h1>
          </div>
          <p className="text-gray-600">
            Create, track, and manage all your projects and teams
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors"
        >
          <FaPlus className="mr-2" /> Add Project
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setCurrentTab(tab);
              setPage(1);
              setSelectedProject(null);
              setTasks([]);
              setError("");
            }}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${currentTab === tab
                ? "bg-[#113a69] text-white"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-700">
              <th className="px-4 py-3 border-b">Project</th>
              <th className="px-4 py-3 border-b">Team</th>
              <th className="px-4 py-3 border-b">Timeline</th>
              <th className="px-4 py-3 border-b">Progress</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b">Priority</th>
              <th className="px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const daysRemaining = getDaysRemaining(project.deadline);
                return (
                  <tr
                    key={project._id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${selectedProject?._id === project._id ? "bg-blue-50" : ""
                      }`}
                    onClick={() => handleProjectClick(project)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-[#113a69] text-xs font-medium border-2 border-white"
                            title={member.name}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium border-2 border-white">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>Start: {formatDate(project.startDate)}</div>
                        <div>Deadline: {formatDate(project.deadline)}</div>
                        <div
                          className={`font-medium ${daysRemaining < 0
                              ? "text-red-600"
                              : daysRemaining <= 7
                                ? "text-orange-600"
                                : "text-gray-600"
                            }`}
                        >
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)} days overdue`
                            : daysRemaining === 0
                              ? "Due today"
                              : `${daysRemaining} days left`}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${project.progress === 100
                                ? "bg-green-500"
                                : "bg-[#113a69]"
                              }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={project.status}
                        onChange={(e) =>
                          handleStatusChange(project._id, e.target.value)
                        }
                        className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(project);
                          }}
                          className="text-[#113a69] hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project._id);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Task List */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#113a69]">
              Tasks for {selectedProject.name}
            </h2>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors"
            >
              <FaPlus className="mr-2" /> Add Task
            </button>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500">No tasks assigned for this project.</p>
          ) : (
            <div className="space-y-4">
              {selectedProject.team.map((member) => {
                const memberTasks = tasks.filter(
                  (task) => task.employeeId._id === (member._id || member)
                );
                return (
                  <div key={member._id || member} className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {member.name}
                    </h3>
                    {memberTasks.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No tasks assigned to {member.name}.
                      </p>
                    ) : (
                      <ul className="list-disc pl-5 mt-2">
                        {memberTasks.map((task) => (
                          <li key={task._id} className="text-sm text-gray-700">
                            {task.description} ({task.status})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editProject ? "Edit Project" : "Add New Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress
                </label>
                <input
                  type="number"
                  value={form.progress}
                  onChange={(e) =>
                    setForm({ ...form, progress: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                  rows="3"
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Members *
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {employees.map((employee) => (
                    <label
                      key={employee._id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={form.team.includes(employee._id)}
                        onChange={() => toggleTeamMember(employee._id)}
                        className="rounded border-gray-300 text-[#113a69] focus:ring-[#113a69]"
                      />
                      <span className="text-sm">
                        {employee.name} -{" "}
                        {employee.department?.name || "No Department"}
                      </span>
                    </label>
                  ))}
                </div>
                {form.team.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Please select at least one team member
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editProject
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Add Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTask();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  value={taskForm.employeeId}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, employeeId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                  required
                >
                  <option value="" disabled>
                    Select an employee
                  </option>
                  {selectedProject.team.map((member) => (
                    <option key={member._id || member} value={member._id || member}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description *
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113a69]"
                  rows="3"
                  placeholder="Enter task description"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#113a69] text-white rounded-lg hover:bg-[#1b5393] transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}