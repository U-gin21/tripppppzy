import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await apiRequest('faqs', 'list');
      setFaqs(res.faqs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(search.toLowerCase()) || 
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5 animate-fade-in">
      <div className="text-center mb-5">
        <span className="badge bg-success rounded-pill px-3 py-2 mb-3 text-uppercase">Help Center</span>
        <h1 className="fw-bold text-gradient display-4">What can we help?</h1>
        <p className="text-muted lead col-md-6 mx-auto">Find answers to common queries about Tripzy's services, companion matches, and payments.</p>
        <div className="col-md-6 mx-auto mt-4">
          <div className="input-group shadow-sm rounded-pill overflow-hidden border">
            <span className="input-group-text bg-white border-0 ps-3">
              <i className="bi bi-search text-emerald"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-0 py-2 ps-2" 
              placeholder="Search for answers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ boxShadow: 'none', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-emerald" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="accordion shadow-sm rounded-4 overflow-hidden border border-light" id="faqAccordion">
              {filteredFaqs.map((faq, index) => (
                <div className="accordion-item border-0 border-bottom" key={faq.id}>
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button 
                      className={`accordion-button fw-bold py-3 ${index !== 0 ? 'collapsed' : ''}`} 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#collapse${index}`} 
                      aria-expanded={index === 0 ? 'true' : 'false'} 
                      aria-controls={`collapse${index}`}
                      style={{ 
                        color: index === 0 ? 'var(--primary-color)' : '#1e293b',
                        background: index === 0 ? 'rgba(5, 150, 105, 0.03)' : '#fff'
                      }}
                    >
                      <i className="bi bi-question-circle-fill me-2 text-emerald"></i> {faq.question}
                    </button>
                  </h2>
                  <div 
                    id={`collapse${index}`} 
                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                    aria-labelledby={`heading${index}`} 
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body bg-light text-muted small" style={{ lineHeight: '1.6' }}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 glass-card border-0">
              <i className="bi bi-patch-question fs-1 text-muted"></i>
              <p className="mt-3 text-muted">No FAQs found matching your search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
