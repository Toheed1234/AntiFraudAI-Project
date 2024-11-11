async function apiRequest(url, method, data, token) {
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(headers);
    }
    try {
      var response;
      if (JSON.stringify(data) === '{}'){
        response = await fetch(url, {
          method,
          headers,
        });
      }
      else{
        response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(data),
        });
      }
      if (response.ok) {
        const text = await response.text();
        if (text) {
          return JSON.parse(text);
  } 
        else {
          return response;
  }
      } 
      else {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    } 
    catch (error) {
      console.error('Error occurred:', error);
    }
  }

module.exports = apiRequest;