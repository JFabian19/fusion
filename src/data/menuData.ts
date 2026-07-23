export interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
  badge?: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  items: Dish[];
}

export const DEFAULT_MENU_DATA: Category[] = [
  {
    id: "entradas-sopas",
    nombre: "Entradas y Sopas",
    descripcion: "Incluidas en la elección de tu Menú del Día",
    items: [
      {
        nombre: "Sopa de Choro",
        descripcion: "Reconfortante sopa concentrada de choros marinos frescos, kion y cilantro.",
        precio: "Incluido",
        badge: "Sopa"
      },
      {
        nombre: "Sopa de Pollo",
        descripcion: "Sopa casera criolla con legumbres frescas y sustanciosa presa de pollo.",
        precio: "Incluido",
        badge: "Sopa"
      },
      {
        nombre: "Alita Broaster",
        descripcion: "Crujiente alita de pollo empanizada doradita acompañada de salsa criolla.",
        precio: "Entrada",
        badge: "Entrada"
      },
      {
        nombre: "Ceviche de Pescado",
        descripcion: "Fresco ceviche marinado al instante con limón sutil, ají, camote y choclo.",
        precio: "Entrada",
        badge: "Favorito"
      },
      {
        nombre: "Huevo a la Rusa",
        descripcion: "Clásica ensalada de verduras cocidas en cubitos con suave mayonesa y huevo duro.",
        precio: "Entrada",
        badge: "Entrada"
      },
      {
        nombre: "Ocopa Arequipeña",
        descripcion: "Papas sancochadas bañadas en cremoso aderezo de huacatay, queso fresco y maní.",
        precio: "Entrada",
        badge: "Criollo"
      },
      {
        nombre: "Ensalada de Palta",
        descripcion: "Fresca palta madura con lechuga orgánica, tomate y aliño especial de la casa.",
        precio: "Entrada",
        badge: "Saludable"
      }
    ]
  },
  {
    id: "menu-13",
    nombre: "Menú del Día - S/. 13.00",
    descripcion: "Incluye Sopa o Entrada + Plato de Fondo + Refresco de Manzana",
    items: [
      {
        nombre: "1. Pollo al romero con puré de espinaca",
        descripcion: "Jugoso pollo sazonado al romero servido con cremoso puré de espinaca y arroz.",
        precio: "S/. 13.00"
      },
      {
        nombre: "2. Seco de res a la norteña con frejoles",
        descripcion: "Tierna carne macerada en cilantro y chicha de jora, acompañada de frejoles.",
        precio: "S/. 13.00"
      },
      {
        nombre: "3. Sudado de pescado con yuca",
        descripcion: "Fresco pescado guisado en jugoso aderezo de tomate, cebolla, ají y yucas sancochadas.",
        precio: "S/. 13.00"
      },
      {
        nombre: "4. Pollo a la plancha con papa sancochada",
        descripcion: "Pechuga dorada a la plancha acompañada de papas sancochadas y ensalada.",
        precio: "S/. 13.00"
      },
      {
        nombre: "5. Chicharrón de pollo con papas fritas",
        descripcion: "Crocantes trozos de pollo dorados a la perfección con papas fritas.",
        precio: "S/. 13.00"
      },
      {
        nombre: "6. Chicharrón de pota con yuca frita",
        descripcion: "Tiras de pota empanizadas muy crujientes servidas con yucas fritas y salsa criolla.",
        precio: "S/. 13.00"
      },
      {
        nombre: "7. Chicharrón de pescado con yuca frita",
        descripcion: "Trozos de pescado frito crocante con yucas doradas y zarza criolla.",
        precio: "S/. 13.00"
      },
      {
        nombre: "8. Cachema entera frita con yuca frita",
        descripcion: "Pescado cachema entero frito bien crujiente con yuca frita y arroz.",
        precio: "S/. 13.00"
      },
      {
        nombre: "9. Filete de bonito con frejoles",
        descripcion: "Filete de bonito sellado a la sartén servido con frejoles criollos y arroz.",
        precio: "S/. 13.00"
      },
      {
        nombre: "10. Bonito a la parrilla con frejoles",
        descripcion: "Bonito marinado y dorado a la parrilla servido con frejoles de la casa.",
        precio: "S/. 13.00"
      },
      {
        nombre: "11. Vainita saltada de pollo o carne",
        descripcion: "Salteado jugoso de vainitas, cebolla y tomate con pollo o carne de res.",
        precio: "S/. 13.00"
      },
      {
        nombre: "12. Brócoli saltada de pollo o carne",
        descripcion: "Nutritivo saltado de brócoli fresco con tiras de pollo o res al wok.",
        precio: "S/. 13.00"
      },
      {
        nombre: "13. Mollejita saltada",
        descripcion: "Mollejitas de pollo salteadas al wok con cebolla, tomate y papas fritas.",
        precio: "S/. 13.00"
      },
      {
        nombre: "14. Lomito de pollo con frejoles",
        descripcion: "Tiras de pechuga salteadas con cebolla y tomate servidas con frejoles.",
        precio: "S/. 13.00"
      },
      {
        nombre: "15. Bistek de hígado ó res con frejoles",
        descripcion: "Jugoso bistek de hígado o carne de res sazonado y servido con frejoles.",
        precio: "S/. 13.00"
      },
      {
        nombre: "16. Bistek de res con frejoles",
        descripcion: "Bistek de res sazonado a la plancha servido con frejoles guisados.",
        precio: "S/. 13.00"
      },
      {
        nombre: "17. Milanesa de pollo con papas fritas",
        descripcion: "Pechuga apanada bien doradita con papas fritas y ensalada fresca.",
        precio: "S/. 13.00"
      },
      {
        nombre: "18. Polladita con papas fritas",
        descripcion: "Pollo macerado en ají panca y especias criollas frito con papas.",
        precio: "S/. 13.00"
      },
      {
        nombre: "19. Chuleta de chancho con papas fritas",
        descripcion: "Jugosa chuleta de cerdo frita a la plancha servida con papas fritas.",
        precio: "S/. 13.00"
      },
      {
        nombre: "20. Arroz a la cubana",
        descripcion: "Arroz blanco graneado servido con huevos fritos, plátano frito y salsa criolla.",
        precio: "S/. 13.00"
      }
    ]
  },
  {
    id: "menu-15",
    nombre: "Menú Especial - S/. 15.00",
    descripcion: "Platos especiales + Sopa o Entrada + Refresco de Manzana",
    items: [
      {
        nombre: "21. Trucha entera frita con papas doradas",
        descripcion: "Trucha andina entera frita a la crocantez perfecta con papas doradas y ensalada.",
        precio: "S/. 15.00",
        badge: "Recomendado"
      },
      {
        nombre: "22. Arroz Chaufa de pollo",
        descripcion: "Arroz chaufa al wok oriental con pechuga de pollo, cebollita china y tortilla de huevo.",
        precio: "S/. 15.00"
      },
      {
        nombre: "23. Chuleta de chancho ó hígado encebollado c/n papa",
        descripcion: "Chuleta o hígado jugoso smothered con generoso encebollado criollo y papa.",
        precio: "S/. 15.00"
      },
      {
        nombre: "24. Milanesa a la napolitana con papas fritas",
        descripcion: "Milanesa de pollo cubierta con salsa de tomate criolla, queso fundido y papas fritas.",
        precio: "S/. 15.00"
      }
    ]
  },
  {
    id: "menu-18",
    nombre: "Platos Ejecutivos - S/. 18.00",
    descripcion: "Especialidades criollas al wok + Sopa o Entrada + Refresco de Manzana",
    items: [
      {
        nombre: "25. Pollo saltado",
        descripcion: "Trosos de pechuga salteados al fuego vivo con cebolla, tomate, ají amarillo y papas.",
        precio: "S/. 18.00"
      },
      {
        nombre: "26. Lomo saltado",
        descripcion: "Tradicional Lomo Saltado flambeado al wok con trozos de res, cebolla, tomate y papas fritas.",
        precio: "S/. 18.00",
        badge: "Top Ventas"
      },
      {
        nombre: "27. Arroz Chaufa mixto (pollo + carne)",
        descripcion: "Delicioso chaufa peruano con combinación de pechuga de pollo y finas tiras de res.",
        precio: "S/. 18.00"
      }
    ]
  },
  {
    id: "menu-23",
    nombre: "Especialidades Fusión - S/. 23.00",
    descripcion: "Platos contundentes premium + Sopa o Entrada + Refresco de Manzana",
    items: [
      {
        nombre: "28. Lomo saltado a lo pobre",
        descripcion: "Jugoso lomo saltado acompañado de plátano frito, huevo frito, papas y arroz.",
        precio: "S/. 23.00",
        badge: "Chef Spec"
      },
      {
        nombre: "29. Bistek o milanesa a lo pobre",
        descripcion: "Gran bistek o milanesa apanada servida con plátano frito, huevo frito y papas fritas.",
        precio: "S/. 23.00"
      },
      {
        nombre: "30. Arroz Chaufa mixto con plátano frito",
        descripcion: "Chaufa mixto de pollo y carne flambeado, acompañado de plátanos fritos.",
        precio: "S/. 23.00"
      },
      {
        nombre: "31. Arroz chaufa amazónico",
        descripcion: "Chaufa regional amazónico elaborado con exquisita cecina ahumada y plátano bellaco frito.",
        precio: "S/. 23.00",
        badge: "Amazónico"
      }
    ]
  },
  {
    id: "adicionales",
    nombre: "Bebidas y Adicionales",
    descripcion: "Complementa tu pedido",
    items: [
      {
        nombre: "Refresco de Manzana",
        descripcion: "Refresco natural heladito de manzana hecho en casa. Incluido en tu menú.",
        precio: "S/. 0.00",
        badge: "Incluido"
      }
    ]
  }
];
