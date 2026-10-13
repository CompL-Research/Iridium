export type AuthorRole = "Maintainer" | "Contributor" | "Advisor";

export type Author = {
  givenNames: string;
  familyNames?: string;
  honorific?: string;
  affiliation: string;
  role: AuthorRole;
  email?: string;
  orcid?: string;
};

export const fullName = (a: Author): string =>
  a.familyNames ? `${a.givenNames} ${a.familyNames}` : a.givenNames;

const AUTHORS: Array<Author> = [
  {
    givenNames: "Meetesh Kalpesh",
    familyNames: "Mehta",
    affiliation: "IIT Bombay",
    role: "Maintainer",
    email: "meeteshmehta@cse.iitb.ac.in",
    orcid: "https://orcid.org/0009-0004-1371-5483"
  },
  { givenNames: "Anirudh", familyNames: "Garg", affiliation: "IIT Bombay", role: "Contributor" },
  { givenNames: "Aneeket", familyNames: "Yadav", affiliation: "IIT Delhi", role: "Contributor" },
  { givenNames: "Hari", familyNames: "Shankar", affiliation: "IIT Bombay", role: "Contributor" },
  { givenNames: "Manas", familyNames: "Thakur", honorific: "Dr", affiliation: "IIT Bombay", role: "Advisor" },
];

export default AUTHORS;
