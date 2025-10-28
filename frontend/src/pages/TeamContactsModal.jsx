import React, { useState, useEffect } from 'react';
import API from "../api";

const TeamContactsModal = ({ taskId, isOpen, onClose }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTeamContacts();
    }
  }, [isOpen, taskId]);

  const fetchTeamContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get(`/api/tasks/${taskId}/team-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMembers(response.data.teamMembers);
    } catch (error) {
      console.error('Error fetching team contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactAction = (type, value, memberName) => {
    switch (type) {
      case 'email':
        window.open(`mailto:${value}?subject=Collaboration on Task&body=Hi, let's connect regarding our task collaboration.`);
        break;
      case 'github':
        window.open(value, '_blank');
        break;
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'linkedin':
        window.open(value, '_blank');
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Team Contacts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {loading ? (
          <p>Loading contacts...</p>
        ) : (
          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{member.username}</h4>
                    <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                  </div>
                  {member.role === 'creator' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Creator
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {member.github_url && member.show_github && (
                    <button
                      onClick={() => handleContactAction('github', member.github_url, member.username)}
                      className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <span className="mr-2">🐙</span>
                      <span className="flex-1">GitHub</span>
                      <span className="text-blue-500 text-xs">Visit</span>
                    </button>
                  )}

                  {member.email && member.show_email && (
                    <button
                      onClick={() => handleContactAction('email', member.email, member.username)}
                      className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <span className="mr-2">📧</span>
                      <span className="flex-1">Email</span>
                      <span className="text-blue-500 text-xs">Contact</span>
                    </button>
                  )}

                  {member.phone && member.show_phone && (
                    <button
                      onClick={() => handleContactAction('phone', member.phone, member.username)}
                      className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <span className="mr-2">📞</span>
                      <span className="flex-1">Phone</span>
                      <span className="text-blue-500 text-xs">Call</span>
                    </button>
                  )}

                  {member.linkedin_url && (
                    <button
                      onClick={() => handleContactAction('linkedin', member.linkedin_url, member.username)}
                      className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                    >
                      <span className="mr-2">💼</span>
                      <span className="flex-1">LinkedIn</span>
                      <span className="text-blue-500 text-xs">Connect</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamContactsModal;