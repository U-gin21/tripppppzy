const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost/TRIPZY%20FINAL/api' 
  : window.location.origin + '/TRIPZY%20FINAL/api';

export const getUploadUrl = (path) => {
  if (!path) return '';
  const root = window.location.origin.includes('localhost:5173')
    ? 'http://localhost/TRIPZY%20FINAL'
    : window.location.origin + '/TRIPZY%20FINAL';
  return `${root}/uploads/${path}`;
};

export async function apiRequest(controller, action, method = 'GET', data = null) {
  let url = `${API_BASE}/index.php?controller=${controller}&action=${action}`;
  
  if (method === 'GET' && data) {
    const params = new URLSearchParams(data).toString();
    url += `&${params}`;
  }

  const options = {
    method,
    credentials: 'include', // Crucial for PHP Session support
  };

  if (method !== 'GET' && data) {
    if (data instanceof FormData) {
      // Let browser set the boundaries automatically for form-data uploads
      options.body = data;
    } else {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.error || json.message || 'Request failed.');
    }
    return json;
  } catch (error) {
    console.error(`API Error on ${controller}/${action}:`, error);
    throw error;
  }
}
