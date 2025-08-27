// src/page/resourcespage.js
import React, { useState } from "react";
import "./resourcespage.css";

const resources = [
  {
    category: "Advocacy & General Resources",
    items: [
      { name: "Georgia Equality", address: "1530 DeKalb Ave NE, Suite A, Atlanta, GA 30307", phone: "(404) 523-3070" },
      { name: "TRANScending Barriers Atlanta", address: "27015 Ridge Rd", phone: "(770) 970-0810" },
      { name: "ACLU of Georgia", address: "353 Peachtree Hills Ave NE #115, Atlanta, GA 30305", phone: "(404) 523-6201" },
      { name: "City of Atlanta Mayor's Division of LGBTQ Affairs", url: "https://atlgbtq.atlantaga.gov/" },
      { name: "I Am Human Foundation, Inc.", address: "P.O. Box 5493, Atlanta, GA 31107", phone: "(404) 594-5509" },
      { name: "Southerners On New Ground (SONG)", email: "kindred@southernersonnewground.org" },
      { name: "The Health Initiative", url: "https://thehealthinitiative.org/" },
      { name: "Atlanta Pride Committee", address: "1530 DeKalb Ave NE, Ste D, Atlanta, GA 30307", phone: "(404) 979-0524" },
    ],
  },
  {
    category: "Legal Aid & Support",
    items: [
      { name: "Lambda Legal", address: "730 Peachtree Street NE, #640, Atlanta, GA 30308", phone: "(404) 897-1880" },
      { name: "Atlanta Legal Aid Society", address: "54 Ellis Street, NE, Atlanta, GA 30303", phone: "(404) 524-5811" },
      { name: "Kitchens New Cleghorn, LLC", address: "2973 Hardman Court, N.E., Atlanta, GA 30305", phone: "(678) 244-2880" },
      { name: "GeorgiaLegalAid.org", url: "https://www.georgialegalaid.org/" },
      { name: "Stonewall Bar Association of Georgia", address: "P.O. Box 720516, Atlanta, GA 30358", phone: "(404) 996-0370" },
      { name: "Diaz & Gaeta Law", address: "133 Carnegie Way NW, Suite 100, Atlanta, GA 30303", phone: "(678) 503-2780" },
      { name: "Georgia Legal Services Program", address: "104 Marietta St NW, Suite 250, Atlanta, GA 30303", phone: "(404) 614-3964" },
    ],
  },
  {
    category: "Healthcare & Wellness",
    items: [
      { name: "Emory Transgender Clinic", address: "Emory University Hospital Midtown", phone: "(404) 778-3280" },
      { name: "Feminist Center for Reproductive Liberation", address: "1924 Cliff Valley Way NE, Atlanta, GA 30329", phone: "(404) 728-7900" },
      { name: "AvitaCare Atlanta", address: "2140 Peachtree Rd, Ste 232, Atlanta, GA 30309", phone: "(404) 231-4431" },
      { name: "Erin Everett, NP-C, AAHIVS", address: "1700 Briarcliff Rd NE, Atlanta, GA 30306", phone: "(404) 228-2648" },
      { name: "Positive Impact Health Centers", phone: "(404) 589-9040", address: "Duluth & Marietta" },
      { name: "Intown Primary Care", address: "2795 Lawrenceville Hwy, Suite 210, Decatur, GA 30033", phone: "(404) 939-2475" },
      { name: "Planned Parenthood Southeast", address: "440 Moreland Avenue SE, Atlanta, GA 30316", phone: "(404) 688-9300" },
      { name: "AID Atlanta", address: "1605 Peachtree St NE, Atlanta, GA 30309", phone: "(404) 870-7700" },
      { name: "Someone Cares", address: "1950 Spectrum Circle, Suite 200, Marietta, GA 30067", phone: "(678) 921-2706" },
      { name: "QueerMed", url: "https://queermed.com/" },
      { name: "OutCare Health", url: "https://www.outcarehealth.org/" },
    ],
  },
  {
    category: "Mental Health & Substance Abuse",
    items: [
      { name: "Resilience Behavioral Health of Georgia", address: "1961 N Druid Hills Rd, Atlanta, GA 30329", phone: "(866) 385-6184" },
      { name: "The Summit Wellness Group", phone: "(770) 299-1677" },
      { name: "Skyland Trail", address: "126 Johnson Ferry Rd, Sandy Springs, GA 30328", phone: "(404) 315-7724" },
      { name: "The Therapy Den", phone: "(844) 382-3336" },
      { name: "Psychology Today", url: "https://www.psychologytoday.com/us/groups/ga/atlanta?category=transgender" },
    ],
  },
  {
    category: "Crisis & Support Hotlines",
    items: [
      { name: "Trans Lifeline", phone: "(877) 565-8860" },
      { name: "The Trevor Project", phone: "1-866-488-7386" },
      { name: "LGBT National Help Center", phone: "(888) 843-4564" },
      { name: "Georgia Overdose Prevention", url: "https://georgiaoverdoseprevention.org/" },
      { name: "GLBTQ Legal Advocates & Defenders (GLAD)", phone: "1-800-455-4523" },
    ],
  },
  {
    category: "Support Groups & Community Centers",
    items: [
      { name: "PFLAG Atlanta", address: "1730 Northeast Expy NE, Atlanta, GA 30329", phone: "(678) 561-7354" },
      { name: "TransParent USA (Atlanta Chapter)", email: "atlanta.ga@transparentusa.org" },
      { name: "Trans(forming)", url: "http://www.trans-forming.org/" },
      { name: "Trans Gentlemen of Excellence", url: "https://tgeinc.org/" },
      { name: "Charis Books & More", address: "184 S Candler St, Decatur, GA 30030", phone: "(404) 524-0304" },
      { name: "Destination Tomorrow Atlanta", address: "1419 Mayson St NE, Atlanta, GA 30324", phone: "(404) 254-3971" },
    ],
  },
  {
    category: "Housing & Youth Resources",
    items: [
      { name: "Lost-n-Found Youth", address: "2585 Chantilly Dr NE, Atlanta, GA 30324", phone: "(678) 856-7824" },
      { name: "Trans Housing Atlanta Program (THAP)", phone: "(404) 458-7948" },
      { name: "Trans Housing Coalition (THC)", url: "https://www.transhousingcoalition.org/" },
      { name: "Housing Authority of the City of Atlanta", address: "230 John Wesley Dobbs Ave NE, Atlanta, GA 30303", phone: "(404) 892-4968" },
      { name: "Fulton County Health Services", address: "141 Pryor St SW, Suite 5001, Atlanta, GA 30303", phone: "(404) 613-5800" },
    ],
  },
];

export default function ResourcesPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="matrix-bg">
      <h1 className="title">Trans Resources Directory</h1>
      <input
        type="text"
        placeholder="Search resources..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      {resources.map((section, idx) => {
        const filtered = section.items.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        if (filtered.length === 0) return null;
        return (
          <div key={idx} className="section">
            <h2 className="section-title">{section.category}</h2>
            <ul>
              {filtered.map((item, i) => (
                <li key={i} className="resource-item">
                  <strong>{item.name}</strong>
                  {item.url && (
                    <>
                      {" "}
                      –{" "}
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {item.url}
                      </a>
                    </>
                  )}
                  {item.address && <div>📍 {item.address}</div>}
                  {item.phone && <div>📞 {item.phone}</div>}
                  {item.email && <div>📧 {item.email}</div>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
