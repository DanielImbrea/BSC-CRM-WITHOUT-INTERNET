/**
 * Stare de sesiune în memorie, în main process.
 * Aplicația e single-user/single-proces, deci nu avem nevoie de token-uri
 * sau sesiuni persistate — la închiderea aplicației, sesiunea se pierde
 * și utilizatorul trebuie să introducă din nou parola la următoarea pornire.
 */
let authenticated = false;

export const session = {
  isAuthenticated(): boolean {
    return authenticated;
  },
  markAuthenticated(): void {
    authenticated = true;
  },
  clear(): void {
    authenticated = false;
  },
};
