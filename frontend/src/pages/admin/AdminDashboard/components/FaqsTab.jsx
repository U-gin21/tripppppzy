import React, { useState } from 'react';
import { apiRequest } from '../../../../api';

export default function FaqsTab({ faqs, fetchFaqs, showConfirm }) {
  // FAQ Creation State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('faqs', 'create', 'POST', {
        question: faqQuestion,
        answer: faqAnswer
      });
      alert("FAQ created successfully!");
      setFaqQuestion('');
      setFaqAnswer('');
      fetchFaqs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = (id) => {
    showConfirm(
      "Delete this FAQ?",
      async () => {
        try {
          await apiRequest('faqs', 'delete', 'POST', { id });
          alert("FAQ deleted.");
          fetchFaqs();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete FAQ"
    );
  };

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">FAQ Management</h2>
      <div className="row g-4">
        {/* Form */}
        <div className="col-md-4">
          <div className="card glass-card p-4 border-0">
            <h5 className="fw-bold mb-3 text-gradient">Add FAQ Item</h5>
            <form onSubmit={handleCreateFaq}>
              <div className="mb-3">
                <label className="form-label small fw-bold">FAQ Question</label>
                <input type="text" className="form-control rounded-3" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} required />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">FAQ Answer</label>
                <textarea className="form-control rounded-3" rows="4" value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} required></textarea>
              </div>
              <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill shadow-sm">Save FAQ</button>
            </form>
          </div>
        </div>
        
        {/* List */}
        <div className="col-md-8">
          <div className="card glass-card p-4 border-0">
            <h5 className="fw-bold mb-3 text-gradient">System FAQs</h5>
            <div className="list-group list-group-flush">
              {faqs.map(f => (
                <div className="list-group-item bg-transparent px-0 py-3" key={f.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-1">{f.question}</h6>
                      <p className="text-muted small mb-0">{f.answer}</p>
                    </div>
                    <button className="btn btn-outline-danger btn-sm rounded-circle ms-3" onClick={() => handleDeleteFaq(f.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
