export type PriceRow = { name: string; cost: string; note?: string };
export type PriceBlock = {
  id: string;
  num: string | null;
  kicker: string;
  title: string;
  rows: PriceRow[];
  note?: string;
  link?: { label: string; href: string };
};

// Approved public price snapshot, 2026-09-07. Runtime Google Sheets content remains primary.
// Operational booking modes, durations and doctor mappings live separately in CRM.
export const priceBlocks: PriceBlock[] = [
  {
    "id": "zagalni",
    "num": "01",
    "kicker": "Загальні",
    "title": "Консультація та діагностика",
    "rows": [
      {
        "name": "Консультація стоматолога",
        "cost": "500 грн"
      },
      {
        "name": "Прицільний рентген",
        "cost": "Входить у вартість консультації",
        "note": "Окремо не тарифікується."
      }
    ]
  },
  {
    "id": "profilaktyka",
    "num": "02",
    "kicker": "Профілактика і гігієна",
    "title": "Профілактика і професійна гігієна",
    "rows": [
      {
        "name": "Професійна чистка Air Flow",
        "cost": "1 800 грн"
      }
    ]
  },
  {
    "id": "estetyka",
    "num": "03",
    "kicker": "Естетична стоматологія",
    "title": "Естетична стоматологія",
    "rows": [
      {
        "name": "Відбілювання зубів",
        "cost": "2 000 грн",
        "note": "Вартість за одну щелепу."
      },
      {
        "name": "Вінір",
        "cost": "10 000 грн",
        "note": "Вартість за один зуб."
      }
    ]
  },
  {
    "id": "terapiya",
    "num": "04",
    "kicker": "Терапевтична стоматологія",
    "title": "Терапевтична стоматологія",
    "rows": [
      {
        "name": "Лікування карієсу",
        "cost": "від 1 300 грн"
      },
      {
        "name": "Художня реставрація",
        "cost": "від 1 800 грн"
      },
      {
        "name": "Лікування каналів",
        "cost": "від 2 000 грн"
      },
      {
        "name": "Лікування під мікроскопом",
        "cost": "від 5 000 грн"
      },
      {
        "name": "Перелікування кореневих каналів під мікроскопом",
        "cost": "від 5 000 грн"
      }
    ]
  },
  {
    "id": "ortodontiya",
    "num": "05",
    "kicker": "Ортодонтія",
    "title": "Ортодонтичне лікування",
    "rows": [
      {
        "name": "Консультація ортодонта",
        "cost": "300 грн"
      },
      {
        "name": "Брекет-система",
        "cost": "від 13 000 грн"
      },
      {
        "name": "Ортодонтичні пластинки",
        "cost": "від 6 000 грн"
      },
      {
        "name": "Ретейнер",
        "cost": "2 000 грн"
      }
    ]
  },
  {
    "id": "hirurgiya",
    "num": "06",
    "kicker": "Хірургічна стоматологія",
    "title": "Хірургічна стоматологія",
    "rows": [
      {
        "name": "Видалення зуба",
        "cost": "від 1 000 грн"
      },
      {
        "name": "Видалення зуба мудрості",
        "cost": "від 2 000 грн"
      },
      {
        "name": "Складне видалення ретинованого зуба",
        "cost": "від 4 000 грн"
      },
      {
        "name": "Імплантація",
        "cost": "від 16 000 грн"
      }
    ]
  },
  {
    "id": "ortopediya",
    "num": "07",
    "kicker": "Ортопедична стоматологія",
    "title": "Коронки та протезування",
    "rows": [
      {
        "name": "Металокерамічна коронка",
        "cost": "3 800 грн"
      },
      {
        "name": "Цирконієва коронка",
        "cost": "5 000 грн"
      },
      {
        "name": "Мостоподібний протез",
        "cost": "від 6 000 грн",
        "note": "Фінальна вартість залежить від кількості зубів."
      },
      {
        "name": "Протезування на імплантах",
        "cost": "від 90 000 грн",
        "note": "Під ключ."
      }
    ]
  }
];
