export class ApiService {
  private url;

  constructor(url: string) {
    this.url = url;
  }

  get(url: string): Promise<void> {
    return fetch(`${this.url}${url}`, {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        // Bypass preflight OPTIONS request
        'Content-Type': 'text/plain',
      },
    })
      .then((response) => {
        console.log(response);
      })
      .catch((e) => console.error(e));
  }
}
