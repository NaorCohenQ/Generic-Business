const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
export const api = {
  async getInit(){
    const res = await fetch(`${base}/init`);
    if(!res.ok) throw new Error('Failed to GET /init');
    return res.json();
  },
  async postEvent(evt:any){
    // placeholder for Day 5+
    return fetch(`${base}/event`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(evt) });
  }
};
