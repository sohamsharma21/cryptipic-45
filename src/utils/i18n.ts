
/**
 * Internationalization (i18n) utility for CryptiPic
 * Handles translation and language switching functionality
 */

export type Language = 'en' | 'hi' | 'es';

export interface TranslationContent {
  [key: string]: string | TranslationContent;
}

export interface TranslationData {
  [locale: string]: TranslationContent;
}

// Default language
let currentLanguage: Language = 'en';

// Our translation data - will be expanded with more content
export const translations: TranslationData = {
  en: {
    userManual: {
      title: "CryptiPic User Manual",
      introduction: {
        title: "Introduction to CryptiPic",
        content: "CryptiPic is a secure tool for hiding secret messages in images and extracting detailed metadata. This user manual will guide you through all features and functionality of the application."
      },
      gettingStarted: {
        title: "Getting Started",
        content: "CryptiPic allows you to hide secret messages in images using steganography techniques, reveal hidden messages from images, and extract metadata from images.",
        steps: {
          step1: "1. Select a feature from the navigation menu: Extract Metadata, Hide Message, or Reveal Message.",
          step2: "2. Upload an image using the file uploader.",
          step3: "3. Follow the instructions specific to your selected feature."
        }
      },
      hidingMessages: {
        title: "Hiding Messages",
        content: "This feature allows you to embed secret messages into images that remain invisible to the naked eye.",
        steps: {
          step1: "1. Navigate to the 'Hide Message' page.",
          step2: "2. Upload an image using the file uploader.",
          step3: "3. Enter your secret message in the text field.",
          step4: "4. Create a strong password to protect your message.",
          step5: "5. Select an encryption algorithm (AES-256 is recommended for high security).",
          step6: "6. Choose a steganography method (LSB is the default, DCT offers better resilience).",
          step7: "7. Optionally add decoy messages to improve security.",
          step8: "8. Click 'Hide Message' to process your image.",
          step9: "9. Download the processed image when complete."
        },
        tips: {
          title: "Tips for Hiding Messages",
          tip1: "Use JPEG images with rich details to better conceal your message.",
          tip2: "Longer passwords provide better security.",
          tip3: "Adding decoy messages can provide plausible deniability.",
          tip4: "DCT steganography is more resistant to image manipulation but may slightly reduce image quality."
        }
      },
      revealingMessages: {
        title: "Revealing Messages",
        content: "This feature allows you to extract hidden messages from images that were encoded with CryptiPic.",
        steps: {
          step1: "1. Navigate to the 'Reveal Message' page.",
          step2: "2. Upload an image that contains a hidden message.",
          step3: "3. Enter the password that was used to encrypt the message.",
          step4: "4. Click 'Reveal Message' to extract the hidden content.",
          step5: "5. If multiple messages are found, they will be displayed according to their priority."
        }
      },
      metadata: {
        title: "Working with Metadata",
        content: "This feature allows you to extract and view detailed information from your images, including camera settings, location, and more.",
        steps: {
          step1: "1. Navigate to the 'Extract Metadata' page.",
          step2: "2. Upload an image using the file uploader.",
          step3: "3. View the extracted metadata in organized categories.",
          step4: "4. You can export this data or take action to remove sensitive metadata."
        }
      },
      advancedFeatures: {
        title: "Advanced Features",
        encryptionAlgorithms: {
          title: "Encryption Algorithms",
          content: "CryptiPic offers multiple encryption algorithms for securing your messages:",
          aes: "AES-256: Advanced Encryption Standard with 256-bit keys, offering very high security.",
          chacha: "ChaCha20: A modern stream cipher that is fast and highly secure."
        },
        steganographyMethods: {
          title: "Steganography Methods",
          content: "Different steganography techniques are available:",
          lsb: "LSB (Least Significant Bit): Simple and fast, but less resistant to image manipulation.",
          dct: "DCT (Discrete Cosine Transform): More resistant to compression and manipulation, but slightly reduces image quality.",
          dwt: "DWT (Discrete Wavelet Transform): Advanced technique offering good balance between capacity and resilience."
        },
        decoyMessages: {
          title: "Using Decoy Messages",
          content: "Decoy messages provide an additional layer of security through plausible deniability:",
          step1: "1. Add one or more decoy messages when hiding your actual secret message.",
          step2: "2. Each decoy message has its own password and priority level.",
          step3: "3. If someone forces you to reveal the hidden content, you can provide the password to a decoy message instead."
        }
      },
      securityBestPractices: {
        title: "Security Best Practices",
        practices: {
          practice1: "Use strong, unique passwords for each hidden message.",
          practice2: "Don't share your steganographic images on social media platforms, as they may compress or modify the images.",
          practice3: "Use decoy messages when dealing with sensitive information.",
          practice4: "Consider using the DCT algorithm for important messages as it's more resilient to image manipulation.",
          practice5: "Keep backup copies of your original images in a secure location.",
          practice6: "Be aware that metadata in images may contain sensitive information like GPS coordinates."
        }
      }
    },
    common: {
      next: "Next",
      previous: "Previous",
      close: "Close",
      language: "Language",
      search: "Search",
      selectLanguage: "Select language"
    },
    languages: {
      en: "English",
      hi: "Hindi",
      es: "Spanish"
    }
  },
  hi: {
    userManual: {
      title: "क्रिप्टीपिक उपयोगकर्ता मैनुअल",
      introduction: {
        title: "क्रिप्टीपिक का परिचय",
        content: "क्रिप्टीपिक छवियों में गुप्त संदेश छिपाने और विस्तृत मेटाडेटा निकालने के लिए एक सुरक्षित उपकरण है। यह उपयोगकर्ता मैनुअल आपको एप्लिकेशन की सभी सुविधाओं और कार्यक्षमता के बारे में मार्गदर्शन करेगा।"
      },
      gettingStarted: {
        title: "शुरू करना",
        content: "क्रिप्टीपिक आपको स्टेगैनोग्राफी तकनीकों का उपयोग करके छवियों में गुप्त संदेश छिपाने, छवियों से छिपे संदेशों को प्रकट करने और छवियों से मेटाडेटा निकालने की अनुमति देता है।",
        steps: {
          step1: "1. नेविगेशन मेनू से एक सुविधा चुनें: मेटाडेटा निकालें, संदेश छिपाएं, या संदेश प्रकट करें।",
          step2: "2. फ़ाइल अपलोडर का उपयोग करके एक छवि अपलोड करें।",
          step3: "3. अपनी चयनित सुविधा के लिए विशिष्ट निर्देशों का पालन करें।"
        }
      },
      hidingMessages: {
        title: "संदेश छिपाना",
        content: "यह सुविधा आपको छवियों में गुप्त संदेश एम्बेड करने की अनुमति देती है जो नग्न आंखों के लिए अदृश्य रहते हैं।",
        steps: {
          step1: "1. 'संदेश छिपाएं' पृष्ठ पर नेविगेट करें।",
          step2: "2. फ़ाइल अपलोडर का उपयोग करके एक छवि अपलोड करें।",
          step3: "3. टेक्स्ट फ़ील्ड में अपना गुप्त संदेश दर्ज करें।",
          step4: "4. अपने संदेश की रक्षा के लिए एक मजबूत पासवर्ड बनाएं।",
          step5: "5. एक एन्क्रिप्शन एल्गोरिथ्म चुनें (उच्च सुरक्षा के लिए AES-256 की सिफारिश की जाती है)।",
          step6: "6. एक स्टेगैनोग्राफी विधि चुनें (LSB डिफ़ॉल्ट है, DCT बेहतर लचीलापन प्रदान करता है)।",
          step7: "7. वैकल्पिक रूप से सुरक्षा बढ़ाने के लिए डिकॉय संदेश जोड़ें।",
          step8: "8. अपनी छवि को प्रोसेस करने के लिए 'संदेश छिपाएं' पर क्लिक करें।",
          step9: "9. पूरा होने पर प्रोसेस्ड छवि डाउनलोड करें।"
        },
        tips: {
          title: "संदेश छिपाने के लिए सुझाव",
          tip1: "अपने संदेश को बेहतर तरीके से छिपाने के लिए समृद्ध विवरणों वाली JPEG छवियों का उपयोग करें।",
          tip2: "लंबे पासवर्ड बेहतर सुरक्षा प्रदान करते हैं।",
          tip3: "डिकॉय संदेश जोड़ने से प्लौसिबल डेनायबिलिटी प्रदान की जा सकती है।",
          tip4: "DCT स्टेगैनोग्राफी छवि हेरफेर के प्रति अधिक प्रतिरोधी है लेकिन छवि की गुणवत्ता को थोड़ा कम कर सकती है।"
        }
      },
      revealingMessages: {
        title: "संदेश प्रकट करना",
        content: "यह सुविधा आपको उन छवियों से छिपे संदेशों को निकालने की अनुमति देती है जो क्रिप्टीपिक के साथ एनकोड किए गए थे।",
        steps: {
          step1: "1. 'संदेश प्रकट करें' पृष्ठ पर नेविगेट करें।",
          step2: "2. एक ऐसी छवि अपलोड करें जिसमें छिपा संदेश है।",
          step3: "3. वह पासवर्ड दर्ज करें जिसका उपयोग संदेश को एन्क्रिप्ट करने के लिए किया गया था।",
          step4: "4. छिपी सामग्री को निकालने के लिए 'संदेश प्रकट करें' पर क्लिक करें।",
          step5: "5. यदि कई संदेश मिलते हैं, तो उन्हें उनकी प्राथमिकता के अनुसार प्रदर्शित किया जाएगा।"
        }
      },
      metadata: {
        title: "मेटाडेटा के साथ काम करना",
        content: "यह सुविधा आपको अपनी छवियों से विस्तृत जानकारी निकालने और देखने की अनुमति देती है, जिसमें कैमरा सेटिंग्स, स्थान और अधिक शामिल हैं।",
        steps: {
          step1: "1. 'मेटाडेटा निकालें' पृष्ठ पर नेविगेट करें।",
          step2: "2. फ़ाइल अपलोडर का उपयोग करके एक छवि अपलोड करें।",
          step3: "3. व्यवस्थित श्रेणियों में निकाले गए मेटाडेटा को देखें।",
          step4: "4. आप इस डेटा को निर्यात कर सकते हैं या संवेदनशील मेटाडेटा को हटाने के लिए कार्रवाई कर सकते हैं।"
        }
      },
      advancedFeatures: {
        title: "उन्नत सुविधाएँ",
        encryptionAlgorithms: {
          title: "एन्क्रिप्शन एल्गोरिथ्म",
          content: "क्रिप्टीपिक आपके संदेशों को सुरक्षित करने के लिए कई एन्क्रिप्शन एल्गोरिथ्म प्रदान करता है:",
          aes: "AES-256: 256-बिट कुंजियों के साथ उन्नत एन्क्रिप्शन मानक, बहुत उच्च सुरक्षा प्रदान करता है।",
          chacha: "ChaCha20: एक आधुनिक स्ट्रीम साइफर जो तेज़ और अत्यधिक सुरक्षित है।"
        },
        steganographyMethods: {
          title: "स्टेगैनोग्राफी विधियाँ",
          content: "विभिन्न स्टेगैनोग्राफी तकनीकें उपलब्ध हैं:",
          lsb: "LSB (लीस्ट सिग्निफिकेंट बिट): सरल और तेज़, लेकिन छवि हेरफेर के प्रति कम प्रतिरोधी।",
          dct: "DCT (डिस्क्रीट कोसाइन ट्रांसफॉर्म): कंप्रेशन और हेरफेर के प्रति अधिक प्रतिरोधी, लेकिन छवि गुणवत्ता को थोड़ा कम करता है।",
          dwt: "DWT (डिस्क्रीट वेवलेट ट्रांसफॉर्म): क्षमता और लचीलापन के बीच अच्छा संतुलन प्रदान करने वाली उन्नत तकनीक।"
        },
        decoyMessages: {
          title: "डिकॉय संदेशों का उपयोग",
          content: "डिकॉय संदेश प्लौसिबल डेनायबिलिटी के माध्यम से अतिरिक्त सुरक्षा परत प्रदान करते हैं:",
          step1: "1. अपने वास्तविक गुप्त संदेश को छिपाते समय एक या अधिक डिकॉय संदेश जोड़ें।",
          step2: "2. प्रत्येक डिकॉय संदेश का अपना पासवर्ड और प्राथमिकता स्तर होता है।",
          step3: "3. यदि कोई आपको छिपी सामग्री को प्रकट करने के लिए मजबूर करता है, तो आप इसके बजाय डिकॉय संदेश का पासवर्ड प्रदान कर सकते हैं।"
        }
      },
      securityBestPractices: {
        title: "सुरक्षा के सर्वोत्तम अभ्यास",
        practices: {
          practice1: "प्रत्येक छिपे संदेश के लिए मजबूत, अद्वितीय पासवर्ड का उपयोग करें।",
          practice2: "अपनी स्टेगैनोग्राफिक छवियों को सोशल मीडिया प्लेटफॉर्म पर साझा न करें, क्योंकि वे छवियों को कंप्रेस या संशोधित कर सकते हैं।",
          practice3: "संवेदनशील जानकारी से निपटते समय डिकॉय संदेशों का उपयोग करें।",
          practice4: "महत्वपूर्ण संदेशों के लिए DCT एल्गोरिथ्म का उपयोग करने पर विचार करें क्योंकि यह छवि हेरफेर के लिए अधिक लचीला है।",
          practice5: "अपनी मूल छवियों की बैकअप प्रतियां सुरक्षित स्थान पर रखें।",
          practice6: "जागरूक रहें कि छवियों में मेटाडेटा में संवेदनशील जानकारी जैसे GPS निर्देशांक हो सकते हैं।"
        }
      }
    },
    common: {
      next: "अगला",
      previous: "पिछला",
      close: "बंद करें",
      language: "भाषा",
      search: "खोज",
      selectLanguage: "भाषा चुनें"
    },
    languages: {
      en: "अंग्रेज़ी",
      hi: "हिन्दी",
      es: "स्पेनिश"
    }
  },
  es: {
    userManual: {
      title: "Manual de Usuario de CryptiPic",
      introduction: {
        title: "Introducción a CryptiPic",
        content: "CryptiPic es una herramienta segura para ocultar mensajes secretos en imágenes y extraer metadatos detallados. Este manual de usuario le guiará a través de todas las características y funcionalidades de la aplicación."
      },
      gettingStarted: {
        title: "Primeros Pasos",
        content: "CryptiPic le permite ocultar mensajes secretos en imágenes utilizando técnicas de esteganografía, revelar mensajes ocultos de imágenes y extraer metadatos de imágenes.",
        steps: {
          step1: "1. Seleccione una función del menú de navegación: Extraer Metadatos, Ocultar Mensaje o Revelar Mensaje.",
          step2: "2. Suba una imagen usando el cargador de archivos.",
          step3: "3. Siga las instrucciones específicas para la función seleccionada."
        }
      },
      hidingMessages: {
        title: "Ocultando Mensajes",
        content: "Esta función le permite incrustar mensajes secretos en imágenes que permanecen invisibles a simple vista.",
        steps: {
          step1: "1. Navegue a la página 'Ocultar Mensaje'.",
          step2: "2. Suba una imagen utilizando el cargador de archivos.",
          step3: "3. Ingrese su mensaje secreto en el campo de texto.",
          step4: "4. Cree una contraseña fuerte para proteger su mensaje.",
          step5: "5. Seleccione un algoritmo de cifrado (se recomienda AES-256 para alta seguridad).",
          step6: "6. Elija un método de esteganografía (LSB es el predeterminado, DCT ofrece mejor resistencia).",
          step7: "7. Opcionalmente, añada mensajes señuelo para mejorar la seguridad.",
          step8: "8. Haga clic en 'Ocultar Mensaje' para procesar su imagen.",
          step9: "9. Descargue la imagen procesada cuando termine."
        },
        tips: {
          title: "Consejos para Ocultar Mensajes",
          tip1: "Use imágenes JPEG con detalles ricos para ocultar mejor su mensaje.",
          tip2: "Las contraseñas más largas proporcionan mejor seguridad.",
          tip3: "Añadir mensajes señuelo puede proporcionar negación plausible.",
          tip4: "La esteganografía DCT es más resistente a la manipulación de imágenes pero puede reducir ligeramente la calidad de la imagen."
        }
      },
      revealingMessages: {
        title: "Revelando Mensajes",
        content: "Esta función le permite extraer mensajes ocultos de imágenes que fueron codificadas con CryptiPic.",
        steps: {
          step1: "1. Navegue a la página 'Revelar Mensaje'.",
          step2: "2. Suba una imagen que contenga un mensaje oculto.",
          step3: "3. Ingrese la contraseña que se utilizó para cifrar el mensaje.",
          step4: "4. Haga clic en 'Revelar Mensaje' para extraer el contenido oculto.",
          step5: "5. Si se encuentran múltiples mensajes, se mostrarán según su prioridad."
        }
      },
      metadata: {
        title: "Trabajando con Metadatos",
        content: "Esta función le permite extraer y ver información detallada de sus imágenes, incluidos ajustes de cámara, ubicación y más.",
        steps: {
          step1: "1. Navegue a la página 'Extraer Metadatos'.",
          step2: "2. Suba una imagen utilizando el cargador de archivos.",
          step3: "3. Vea los metadatos extraídos en categorías organizadas.",
          step4: "4. Puede exportar estos datos o tomar medidas para eliminar metadatos sensibles."
        }
      },
      advancedFeatures: {
        title: "Características Avanzadas",
        encryptionAlgorithms: {
          title: "Algoritmos de Cifrado",
          content: "CryptiPic ofrece múltiples algoritmos de cifrado para asegurar sus mensajes:",
          aes: "AES-256: Estándar de Cifrado Avanzado con claves de 256 bits, ofreciendo muy alta seguridad.",
          chacha: "ChaCha20: Un cifrado de flujo moderno que es rápido y altamente seguro."
        },
        steganographyMethods: {
          title: "Métodos de Esteganografía",
          content: "Diferentes técnicas de esteganografía están disponibles:",
          lsb: "LSB (Bit Menos Significativo): Simple y rápido, pero menos resistente a la manipulación de imágenes.",
          dct: "DCT (Transformada de Coseno Discreta): Más resistente a la compresión y manipulación, pero reduce ligeramente la calidad de la imagen.",
          dwt: "DWT (Transformada de Wavelet Discreta): Técnica avanzada que ofrece un buen equilibrio entre capacidad y resistencia."
        },
        decoyMessages: {
          title: "Usando Mensajes Señuelo",
          content: "Los mensajes señuelo proporcionan una capa adicional de seguridad a través de la negación plausible:",
          step1: "1. Añada uno o más mensajes señuelo al ocultar su mensaje secreto real.",
          step2: "2. Cada mensaje señuelo tiene su propia contraseña y nivel de prioridad.",
          step3: "3. Si alguien le obliga a revelar el contenido oculto, puede proporcionar la contraseña de un mensaje señuelo en su lugar."
        }
      },
      securityBestPractices: {
        title: "Mejores Prácticas de Seguridad",
        practices: {
          practice1: "Use contraseñas fuertes y únicas para cada mensaje oculto.",
          practice2: "No comparta sus imágenes esteganográficas en plataformas de redes sociales, ya que pueden comprimir o modificar las imágenes.",
          practice3: "Use mensajes señuelo cuando maneje información sensible.",
          practice4: "Considere usar el algoritmo DCT para mensajes importantes ya que es más resistente a la manipulación de imágenes.",
          practice5: "Mantenga copias de seguridad de sus imágenes originales en un lugar seguro.",
          practice6: "Tenga en cuenta que los metadatos en las imágenes pueden contener información sensible como coordenadas GPS."
        }
      }
    },
    common: {
      next: "Siguiente",
      previous: "Anterior",
      close: "Cerrar",
      language: "Idioma",
      search: "Buscar",
      selectLanguage: "Seleccionar idioma"
    },
    languages: {
      en: "Inglés",
      hi: "Hindi",
      es: "Español"
    }
  }
};

// Get translation function - returns the content for a given key path
export const getTranslation = (path: string, lang: Language = currentLanguage): string => {
  const keys = path.split('.');
  let current: any = translations[lang];
  
  for (const key of keys) {
    if (current[key] === undefined) {
      // Fallback to English if translation doesn't exist
      if (lang !== 'en') {
        return getTranslation(path, 'en');
      }
      return `[Missing translation: ${path}]`;
    }
    current = current[key];
  }
  
  return current as string;
};

// Set the current language
export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
};

// Get the current language
export const getLanguage = (): Language => {
  return currentLanguage;
};
