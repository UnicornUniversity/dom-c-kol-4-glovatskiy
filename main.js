//TODO add imports if needed
//TODO doc

/**
 * Hlavní funkce aplikace.
 * Orchestruje celý proces:
 * 1. vygeneruje seznam zaměstnanců
 * 2. spočítá nad nimi statistiky
 *
 * @param {object} dtoIn vstupní data {count, age:{min,max}}
 * @returns {object} kompletní statistiky
 */
export function main(dtoIn) {
  const employees = generateEmployeeData(dtoIn);
  return getEmployeeStatistics(employees);
}

/**
 * Generuje náhodný seznam zaměstnanců.
 * Každý zaměstnanec obsahuje:
 * - pohlaví
 * - jméno
 * - příjmení
 * - datum narození
 * - úvazek
 *
 * @param {object} dtoIn vstupní konfigurace
 * @returns {Array} seznam zaměstnanců
 */
export function generateEmployeeData(dtoIn) {

  const names = {
    male: ["Jan","Petr","Karel","Tomáš","Lukáš","Martin","Josef","David","Michal","Jakub"],
    female: ["Anna","Marie","Eva","Jana","Lucie","Petra","Tereza","Veronika","Kateřina","Alena"]
  };

  const surnames = {
    male: ["Novák","Svoboda","Novotný","Dvořák","Černý"],
    female: ["Nováková","Svobodová","Novotná","Dvořáková","Černá"]
  };

  const workloads = [10, 20, 30, 40];

  const dtoOut = [];

  for (let i = 0; i < dtoIn.count; i++) {

    // náhodné pohlaví určuje celý profil zaměstnance
    const gender = Math.random() < 0.5 ? "male" : "female";

    dtoOut.push({
      gender,

      // výběr jména podle pohlaví
      name: names[gender][Math.floor(Math.random() * names[gender].length)],

      // výběr příjmení podle pohlaví
      surname: surnames[gender][Math.floor(Math.random() * surnames[gender].length)],

      // datum narození
      birthdate: generateBirthdate(dtoIn.age.min, dtoIn.age.max),

      // náhodný úvazek
      workload: workloads[Math.floor(Math.random() * workloads.length)]
    });
  }

  return dtoOut;
}

/**
 * Vypočítá kompletní statistiky zaměstnanců.
 * Obsahuje:
 * - celkový počet zaměstnanců
 * - rozdělení podle úvazků (10/20/30/40)
 * - průměrný, minimální a maximální věk
 * - medián věku
 * - medián úvazku
 * - průměrný úvazek žen
 * - seznam zaměstnanců seřazený podle úvazku
 *
 * @param {Array} employees seznam zaměstnanců
 * @returns {object} statistiky
 */
export function getEmployeeStatistics(employees) {

  // ===================== CELKOVÝ POČET =====================
  const total = employees.length;

  // ===================== ROZDĚLENÍ ÚVAZKŮ =====================
  const workload10 = employees.filter(e => e.workload === 10).length;
  const workload20 = employees.filter(e => e.workload === 20).length;
  const workload30 = employees.filter(e => e.workload === 30).length;
  const workload40 = employees.filter(e => e.workload === 40).length;

  // ===================== VÝPOČET VĚKU =====================
  // přesný výpočet věku (zohledňuje měsíc a den)
  const ages = employees.map(e => {
    const birth = new Date(e.birthdate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  });

  const averageAge =
    ages.reduce((a, b) => a + b, 0) / ages.length;

  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  // ===================== MEDIÁN VĚKU =====================
  const sortedAges = [...ages].sort((a, b) => a - b);
  const mid = Math.floor(sortedAges.length / 2);

  const medianAge =
    sortedAges.length % 2 === 0
      ? (sortedAges[mid - 1] + sortedAges[mid]) / 2
      : sortedAges[mid];

  // ===================== MEDIÁN ÚVAZKU =====================
  const workloadsOnly = employees
    .map(e => e.workload)
    .sort((a, b) => a - b);

  const midW = Math.floor(workloadsOnly.length / 2);

  const medianWorkload =
    workloadsOnly.length % 2 === 0
      ? (workloadsOnly[midW - 1] + workloadsOnly[midW]) / 2
      : workloadsOnly[midW];

  // ===================== PRŮMĚR ÚVAZKU ŽEN =====================
  const women = employees.filter(e => e.gender === "female");

  const averageWomenWorkload =
    women.length > 0
      ? women.reduce((sum, e) => sum + e.workload, 0) / women.length
      : 0;

  // ===================== SEŘAZENÍ =====================
  // seznam zaměstnanců seřazený dle úvazku od nejmenšího po největší
  const sortedByWorkload = [...employees].sort(
    (a, b) => a.workload - b.workload
  );

  // ===================== VÝSTUP =====================
  return {
    total,
    workload10,
    workload20,
    workload30,
    workload40,
    averageAge: Number(averageAge.toFixed(1)),
    minAge,
    maxAge,
    medianAge,
    medianWorkload,
    averageWomenWorkload,
    sortedByWorkload
  };
}

/**
 * Generuje datum narození pomocí uniformního timestampu.
 *
 * Interval:
 * [now - maxAge * yearMs, now - minAge * yearMs]
 *
 * → každý okamžik v tomto intervalu má stejnou pravděpodobnost
 * → nevzniká chyba s posunem věku (měsíc / den)
 *
 * @param {number} minAge minimální věk
 * @param {number} maxAge maximální věk
 * @returns {string} ISO datum
 */
function generateBirthdate(minAge, maxAge) {
  const now = Date.now();
  const yearMs = 365.25 * 24 * 60 * 60 * 1000;

  const minTime = now - maxAge * yearMs;
  const maxTime = now - minAge * yearMs;

  const randomTime = Math.random() * (maxTime - minTime) + minTime;

  return new Date(randomTime).toISOString();
}
