// El Tomate Italiano — Base de Datos de Productos y Configuración Oficial

const MENU_DATA = {
  pastichos: [
    {
      id: "pasticho-tradicional",
      name: "Pasticho Tradicional",
      description: "4 Capas de pasta con salsa bechamel, nuestra bologna conformada por carne de res y de cerdo, queso mozzarella y pecorino.",
      image: "assets/dishes/pasticho-tradicional.webp",
      hasSizes: true,
      sizes: [
        { id: "individual", name: "Individual (650g)", price: 10, label: "Para 1 persona" },
        { id: "grande", name: "Grande (1.2kg)", price: 18, label: "Para compartir" }
      ],
      tags: ["Clásico", "Tradicional"],
      badge: "El Favorito"
    },
    {
      id: "pasticho-berenjenas",
      name: "Berenjenas",
      description: "Láminas de berenjenas a la plancha, salsa bechamel, nuestra bologna conformada por carne de res y de cerdo, queso mozzarella y pecorino. (La bechamel es opcional)",
      image: "assets/dishes/pasticho-berenjenas.webp",
      hasSizes: true,
      sizes: [
        { id: "individual", name: "Individual (650g)", price: 10, label: "A la plancha" },
        { id: "grande", name: "Grande (1.2kg)", price: 19, label: "Para compartir" }
      ],
      tags: ["Sin gluten", "Casero"],
      badge: "Laminado"
    },
    {
      id: "pasticho-platano",
      name: "Plátano",
      description: "Capas de tajadas de plátano maduro fritas, salsa bechamel, nuestra bologna conformada por carne de res y de cerdo, queso mozzarella y pecorino. (La bechamel es opcional)",
      image: "assets/dishes/pasticho-platano.webp",
      hasSizes: true,
      sizes: [
        { id: "individual", name: "Individual (650g)", price: 10, label: "Tajadas maduras" },
        { id: "grande", name: "Grande (1.2kg)", price: 19, label: "Para compartir" }
      ],
      tags: ["Sabor Criollo", "Original"],
      badge: "Más Vendido"
    },
    {
      id: "pasticho-pollo-4quesos",
      name: "Pollo 4 Quesos y Tocineta",
      description: "4 Capas de pasta con pechuga de pollo cocinada al grill, combinada con nuestra salsa 4 quesos (pecorino, parmesano, mozzarella y queso cremoso), champiñones y tocineta.",
      image: "assets/dishes/pasticho-pollo-4quesos.webp",
      hasSizes: true,
      sizes: [
        { id: "individual", name: "Individual (650g)", price: 12, label: "Pollo al grill" },
        { id: "grande", name: "Grande (1.2kg) (2 personas)", price: 23, label: "Para 2 personas" }
      ],
      tags: ["Cremoso", "Intenso"],
      badge: "Recomendado"
    }
  ],
  salsas: [
    {
      id: "salsa-ragu-polpette",
      name: "Ragú de Polpette",
      description: "Albóndigas conformadas por carne de res y de cerdo, cocinadas lentamente en nuestra salsa napoli.",
      image: "assets/dishes/salsa-ragu-polpette.webp",
      hasSizes: true,
      sizes: [
        { id: "mediano", name: "650 g (4 albóndigas de 60/70 g con salsa napoli)", price: 14, label: "4 albóndigas" },
        { id: "grande", name: "1 kg (8 albóndigas)", price: 26, label: "8 albóndigas" }
      ],
      tags: ["Fuego lento", "Albondigas"],
      badge: "Tradición"
    },
    {
      id: "salsa-napoli",
      name: "Napoli",
      description: "Tomates frescos reducidos por 20 horas de cocción con albahaca, ajo y aceite de oliva extra virgen.",
      image: "assets/dishes/salsa-napoli.webp",
      hasSizes: true,
      sizes: [
        { id: "mediano", name: "500 gr", price: 6, label: "Mediano (500 gr)" },
        { id: "grande", name: "1 kg", price: 10, label: "Grande (1 kg)" }
      ],
      tags: ["Vegetariano", "20 Horas"],
      badge: "Básico"
    },
    {
      id: "salsa-bologna",
      name: "Bologna",
      description: "Carnes de res y cerdo slow-cooked, reducidas con vino Chileno, zanahoria, cebolla y nuestra maravillosa salsa napoli como base.",
      image: "assets/dishes/salsa-bologna.webp",
      hasSizes: true,
      sizes: [
        { id: "mediano", name: "500 gr", price: 10, label: "Mediano (500 gr)" },
        { id: "grande", name: "1 kg", price: 18, label: "Grande (1 kg)" }
      ],
      tags: ["Carne de res/cerdo", "Vino Chileno"],
      badge: "Estelar"
    },
    {
      id: "salsa-puttanesca",
      name: "Puttanesca",
      description: "Anchoas, alcaparras y aceitunas negras cocinadas con tomates fileteados acompañados de nuestra base de salsa Napoli.",
      image: "assets/dishes/salsa-puttanesca.webp",
      hasSizes: true,
      sizes: [
        { id: "mediano", name: "500 gr", price: 9, label: "Mediano (500 gr)" },
        { id: "grande", name: "1 kg", price: 16, label: "Grande (1 kg)" }
      ],
      tags: ["Anchoas y alcaparras", "Intenso"],
      badge: "Mediterráneo"
    },
    {
      id: "salsa-4quesos-tocineta",
      name: "Salsa 4 Quesos con Champiñones y Tocineta",
      description: "4 Capas de pasta con pechuga de pollo cocinada al grill, combinada con nuestra salsa 4 quesos (pecorino, parmesano, mozzarella y queso cremoso), champiñones y tocineta.",
      image: "assets/dishes/salsa-4quesos.webp",
      hasSizes: true,
      sizes: [
        { id: "individual", name: "Individual 650g", price: 12, label: "Porción individual" },
        { id: "grande", name: "Grande 1.2kg (2 personas)", price: 23, label: "Para compartir" }
      ],
      tags: ["Pollo y champiñones", "Queso pecorino/parmesano"],
      badge: "Completo"
    }
  ]
};

// Datos para la transferencia de Pago Móvil (Venezuela)
const CONFIG = {
  whatsappNumber: "584142095922", // Número oficial de El Tomate Italiano (Arturo Riccardi)
  pagoMovil: {
    banco: "BANCO DE VENEZUELA",
    codigoBanco: "0102",
    telefono: "0414-2095922",
    ci: "V-20123456",
    titular: "ARTURO RICCARDI"
  },
  bancosVenezuela: [
    { code: "0102", name: "Banco de Venezuela" },
    { code: "0134", name: "Banesco" },
    { code: "0105", name: "Mercantil" },
    { code: "0108", name: "Provincial" },
    { code: "0191", name: "BNC (Banco Nacional de Crédito)" },
    { code: "0114", name: "Bancaribe" },
    { code: "0115", name: "Banco Exterior" },
    { code: "0174", name: "Banplus" },
    { code: "0171", name: "Banco Activo" },
    { code: "0116", name: "Banco Plaza" },
    { code: "0128", name: "Banco Caroní" },
    { code: "0156", name: "100% Banco" },
    { code: "0163", name: "Banco del Tesoro" },
    { code: "0166", name: "Banco Agrícola de Venezuela" }
  ]
};
