"use client"
import { useEffect, useState } from "react";

export default function DataPage() {
  const [userData, setUserData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:8000/data"); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Data</h1>
      {userData.length === 0 ? (
        <p>No user data available.</p>
      ) : (
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Address</th>
              <th className="border border-gray-300 p-2">About</th>
              <th className="border border-gray-300 p-2">birthdate</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 p-2">{user.email}</td>
                <td className="border border-gray-300 p-2">{user.address}</td>
                <td className="border border-gray-300 p-2">{user.about}</td>
                <td className="border border-gray-300 p-2">{user.birthdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
