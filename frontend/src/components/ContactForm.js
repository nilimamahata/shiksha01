import React from 'react';

const ContactForm = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold mb-4">
           <span className="text-green-800">Feedback</span>
        </h2>
        <p className="text-gray-600 mb-8">
          "We’d love to hear from you! Your feedback helps us improve and serve you better."
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-1">First Name</label>
            <input type="text" required className="w-full p-2 border rounded bg-beige-100" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Last Name</label>
            <input type="text" required className="w-full p-2 border rounded bg-beige-100" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full p-2 border rounded bg-beige-100" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-1">Message</label>
            <textarea required rows="4" className="w-full p-2 border rounded bg-beige-100"></textarea>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-2 bg-green-800 text-white rounded border border-green-800 hover:bg-white hover:text-green-800 transition">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
